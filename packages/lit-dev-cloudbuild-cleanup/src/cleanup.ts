/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {google} from 'googleapis';
import {Octokit} from 'octokit';
import {request} from 'gaxios';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_WEEK_AGO = new Date(Date.now() - ONE_WEEK_IN_MS);

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

/**
 * Overall goals for this cleanup script are
 *
 * - Delete revisions that do not meet any of the following criteria:
 *   1) have traffic routed to it
 *   2) are associated with an open PR (based on traffic tag)
 *   3) were created within the past week
 *
 * Note: In order to delete a revision, it must not be associated with a traffic
 * tag. A traffic tag can be removed by updating a service with a modified list
 * of traffic tags.
 *
 * - Delete all lit-dev docker images in the container registry that do not have
 * an active revision utilizing it.
 *
 * - Delete all lit-dev/cache docker images (created by kaniko) that are older
 * than 1 week.
 *
 * Note: Docker images can only be deleted after deleting all associated tags.
 */
async function main() {
  const {PROJECT_ID, REPO_NAME, _DEPLOY_REGION} = process.env;
  if (!PROJECT_ID || !REPO_NAME || !_DEPLOY_REGION) {
    console.log({PROJECT_ID, REPO_NAME, _DEPLOY_REGION});
    throw new Error(
      'Missing one or more required environment variables: PROJECT_ID, REPO_NAME, _DEPLOY_REGION'
    );
  }

  const octokit = new Octokit();

  const openPrs = new Set<number>();

  console.log('Fetching open PRs from Github');
  const openPrsIterator = octokit.paginate.iterator(octokit.rest.pulls.list, {
    owner: 'lit',
    repo: REPO_NAME,
    state: 'open',
    per_page: 100,
  });

  for await (const {data: prs} of openPrsIterator) {
    for (const pr of prs) {
      openPrs.add(pr.number);
    }
  }

  console.log('Found open PRs', openPrs);

  const run = google.run('v1');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const authClient = await auth.getClient();
  google.options({auth: authClient});

  // Fetch list of revisions across both services.
  // This API provides the revision's created time but does not contain data
  // of any associated traffic tags.
  console.log('Fetching list of revisions');
  const {data} = await run.projects.locations.revisions.list({
    parent: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}`,
  });

  const revisions = data;

  if (!revisions.items) {
    // We should never reach this since there should always be running revisions
    // for the deployed services.
    throw new Error('Found no revision items');
  }

  console.log('Total revisions count', revisions.items.length);

  const revisionsToKeep = new Set<string>();
  for (const rev of revisions.items) {
    if (
      !rev.metadata ||
      !rev.metadata.creationTimestamp ||
      !rev.metadata.name
    ) {
      throw new Error(
        `Found revision with missing necessary metadata: ${JSON.stringify(rev)}`
      );
    }

    if (
      new Date(rev.metadata.creationTimestamp) > ONE_WEEK_AGO ||
      // always keep revision for discord-bot
      rev.metadata.name.startsWith('lit-dev-discord-bot')
    ) {
      revisionsToKeep.add(rev.metadata.name);
    }
  }

  console.log('Revisions younger than a week count', revisionsToKeep.size);

  // Fetch each service and identify additional revisions to keep based on traffic tag.
  // Also update service with filtered traffic array if needed.
  const services = ['lit-dev', 'lit-dev-playground'];
  let serviceUpdated = false;
  for (const serviceName of services) {
    console.log(`Fetching ${serviceName} service`);
    const {data} = await run.projects.locations.services.get({
      name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/services/${serviceName}`,
    });

    if (!data.spec || !data.spec.traffic) {
      throw new Error(`Found no traffic for ${serviceName} service`);
    }

    console.log(`${serviceName} traffic count`, data.spec.traffic.length);

    const trafficToKeep = data.spec.traffic.filter((t) => {
      if (!t.revisionName) {
        throw new Error('Found traffic with no revision name');
      }

      // The set already has revisions to keep based on recency
      if (revisionsToKeep.has(t.revisionName)) {
        return true;
      }

      // Presence of percent > 0 indicates traffic is being routed here
      // i.e. revision is used for current prod deployment
      if (t.percent) {
        revisionsToKeep.add(t.revisionName);
        return true;
      }

      if (t.tag) {
        // Tags should look like "pr529-8b0837f" or "main-45ace0e"
        const prMatch = t.tag.match(/^pr(\d+)-/);
        if (prMatch) {
          // Tags that have PR number require special attention to see if they
          // should be kept
          const prNumber = Number(prMatch[1]);
          if (openPrs.has(prNumber)) {
            revisionsToKeep.add(t.revisionName);
            return true;
          }
        } else if (!t.tag.startsWith('main')) {
          // Unrecognized tags are kept just in case
          console.log(
            `Found unrecognized tag "${t.tag}". This will not be deleted.`
          );
          revisionsToKeep.add(t.revisionName);
          return true;
        }
        // Tags that do begin with "main" require no special attention and can
        // be filtered out if they passed the recency check above
      }

      return false;
    });

    console.log(`${serviceName} traffic to keep count`, trafficToKeep.length);

    if (trafficToKeep.length === 0) {
      // We should never get here since there should be at least one traffic
      // routing for prod deployment
      throw new Error(`Found no ${serviceName} traffic to keep`);
    }

    if (data.spec.traffic.length !== trafficToKeep.length) {
      console.log(`Updating ${serviceName} service`);
      data.spec.traffic = trafficToKeep;
      await run.projects.locations.services.replaceService({
        name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/services/${serviceName}`,
        requestBody: data,
      });
      serviceUpdated = true;
    }
  }

  // Revision status takes some time to update and delete request will error if
  // it is still associated with a tag
  if (serviceUpdated) {
    console.log('Waiting 30 seconds for traffic tags to update');
    await sleep(30_000);
  }

  const imageDigestsToKeep = new Set<string>();
  for (const rev of revisions.items) {
    if (!rev.metadata || !rev.metadata.name) {
      throw new Error('Revision has no name metadata');
    }

    if (!rev.spec || !rev.spec.containers) {
      throw new Error('Revision has no containers');
    }

    if (!revisionsToKeep.has(rev.metadata.name)) {
      console.log(`Deleting revision ${rev.metadata.name}`);
      await run.projects.locations.revisions.delete({
        name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/revisions/${rev.metadata.name}`,
      });
      // Wait 1 second to not hit API limit of 60 per minute
      await sleep(1_000);
    } else {
      // Our revisions only ever have 1 container
      // Image name looks like
      // "us.gcr.io/lit-dev-site/lit.dev/lit-dev@sha256:a5cb77a8bf22754cbe0c68401b8e3c5afbf7844c0fbe6337fd00971fb57211a4"
      // and the part after "@" is the digest
      const digest = rev.spec.containers[0].image?.match(/(?<=@).+$/)?.[0];
      if (!digest) {
        throw new Error('Found no image digest for revision');
      }
      imageDigestsToKeep.add(digest);
    }
  }

  console.log('Count of images in use', imageDigestsToKeep.size);

  const {token} = await authClient.getAccessToken();

  // Clean up gcr lit-dev images that are no longer used
  {
    console.log('Fetching images from gcr');
    const response = await request({
      url: `https://us.gcr.io/v2/${PROJECT_ID}/${REPO_NAME}/lit-dev/tags/list`,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const data = response.data as {
      manifest: Record<string, {tag: string[]; timeCreatedMs: string}>;
      tags: string[];
    };

    console.log('Image tag count', data.tags.length);

    for (const [digest, manifest] of Object.entries(data.manifest)) {
      if (
        !imageDigestsToKeep.has(digest) &&
        // in case image was just created without a revision associated with it
        new Date(Number(manifest.timeCreatedMs)) < ONE_WEEK_AGO
      ) {
        for (const tag of manifest.tag) {
          console.log(`Deleting container registry tag ${tag}`);
          await request({
            url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/manifests/${tag}`,
            method: 'DELETE',
            headers: {
              authorization: 'Bearer ' + token,
            },
          });
        }
        console.log(`Deleting image ${digest}`);
        await request({
          url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/manifests/${digest}`,
          method: 'DELETE',
          headers: {
            authorization: 'Bearer ' + token,
          },
        });
      }
    }
  }

  // Clean up gcr lit-dev/cache images created by kaniko
  {
    console.log('Fetching cache images from gcr');
    const response = await request({
      url: `https://us.gcr.io/v2/${PROJECT_ID}/${REPO_NAME}/lit-dev/cache/tags/list`,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const data = response.data as {
      manifest: Record<string, {tag: string[]; timeCreatedMs: string}>;
      tags: string[];
    };

    console.log('Cache image tag count', data.tags.length);

    for (const [digest, manifest] of Object.entries(data.manifest)) {
      if (new Date(Number(manifest.timeCreatedMs)) < ONE_WEEK_AGO) {
        for (const tag of manifest.tag) {
          console.log(`Deleting container registry tag ${tag}`);
          await request({
            url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/cache/manifests/${tag}`,
            method: 'DELETE',
            headers: {
              authorization: 'Bearer ' + token,
            },
          });
        }
        console.log(`Deleting image ${digest}`);
        await request({
          url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/cache/manifests/${digest}`,
          method: 'DELETE',
          headers: {
            authorization: 'Bearer ' + token,
          },
        });
      }
    }
  }

  console.log('All done!');
}

main();
