import {google} from 'googleapis';
import {Octokit} from 'octokit';
import {request} from 'gaxios';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_WEEK_AGO = new Date(Date.now() - ONE_WEEK_IN_MS);

const {PROJECT_ID, REPO_NAME, _DEPLOY_REGION} = process.env;

if ([PROJECT_ID, REPO_NAME, _DEPLOY_REGION].some((env) => env === undefined)) {
  console.log({PROJECT_ID, REPO_NAME, _DEPLOY_REGION});
  throw new Error(
    'missing one or more required environment variables: PROJECT_ID, REPO_NAME, _DEPLOY_REGION'
  );
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

async function main() {
  const octokit = new Octokit();

  const openPrs = new Set<number>();

  console.log('fetching open PRs from github');
  const openPrsIterator = octokit.paginate.iterator(octokit.rest.pulls.list, {
    owner: 'lit',
    repo: `${REPO_NAME}`,
    state: 'open',
    per_page: 100,
  });

  for await (const {data: prs} of openPrsIterator) {
    for (const pr of prs) {
      openPrs.add(pr.number);
    }
  }

  console.log('found open prs', openPrs);

  const run = google.run('v1');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const authClient = await auth.getClient();
  google.options({auth: authClient});

  // fetch list of revisions across both services
  console.log('fetching list of revisions');
  const {data: revisions} = await run.projects.locations.revisions.list({
    parent: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}`,
  });

  if (!revisions.items) {
    throw new Error('found no revision items');
  }

  console.log('total revisions count', revisions.items.length);

  const revisionsToKeepByRecency = new Set<string>();
  for (const rev of revisions.items) {
    if (!rev.metadata) {
      throw new Error('found no metadata');
    }

    if (new Date(rev.metadata.creationTimestamp!) > ONE_WEEK_AGO) {
      revisionsToKeepByRecency.add(rev.metadata.name!);
    }
  }

  console.log(
    'revisions younger than a week count',
    revisionsToKeepByRecency.size
  );

  // traffic tags must be cleaned up before a revision can be deleted
  const services = ['lit-dev', 'lit-dev-playground'];
  await Promise.all(
    services.map(async (serviceName) => {
      console.log(`fetching ${serviceName} service`);
      const {data} = await run.projects.locations.services.get({
        name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/services/${serviceName}`,
      });

      if (!data.spec || !data.spec.traffic) {
        throw new Error(`found no traffic for ${serviceName} service`);
      }

      console.log(`${serviceName} traffic count`, data.spec.traffic.length);

      const trafficToKeep = data.spec.traffic.filter((t) => {
        return (
          Boolean(t.percent) || // there's traffic being routed here (i.e. prod)
          revisionsToKeepByRecency.has(t.revisionName!) ||
          openPrs.has(parseInt(t.tag!.slice(2), 10))
        );
      });

      console.log(`${serviceName} traffic to keep count`, trafficToKeep.length);

      if (trafficToKeep.length === 0) {
        throw new Error('found no ${service} traffic to keep');
      }

      if (data.spec.traffic.length !== trafficToKeep.length) {
        console.log(`updating ${serviceName} service`);
        data.spec.traffic = trafficToKeep;
        await run.projects.locations.services.replaceService({
          name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/services/${serviceName}`,
          requestBody: data,
        });
      }
    })
  );

  // revision status takes some time to update
  console.log('waiting 30 seconds for traffic tags to update');
  await sleep(30_000);

  // fetching new list of revisions to get the now untagged (inactive) ones
  console.log('fetching new revisions list');
  const {data: newRevisions} = await run.projects.locations.revisions.list({
    parent: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}`,
  });

  if (!newRevisions.items) {
    throw new Error('found no new revision items');
  }

  console.log('looking for inactive revisions to delete');
  const imageDigestsToKeep = new Set<string>();
  for (const rev of newRevisions.items) {
    if (!rev.metadata) {
      throw new Error('revision has no metadata');
    }

    if (!rev.status || !rev.status.conditions) {
      throw new Error('revision has no status conditions');
    }

    if (!rev.spec || !rev.spec.containers) {
      throw new Error('revision has no containers');
    }

    if (
      rev.status.conditions.find((cond) => cond.type === 'Active')!.status !==
        'True' &&
      // extra timestamp check in case the revision was just created and not active because of that
      new Date(rev.metadata.creationTimestamp!) < ONE_WEEK_AGO
    ) {
      console.log(`deleting revision ${rev.metadata.name}`);
      await run.projects.locations.revisions.delete({
        name: `projects/${PROJECT_ID}/locations/${_DEPLOY_REGION}/revisions/${rev.metadata.name}`,
      });
      // wait 1 second to not hit api limit
      await sleep(1_000);
    } else {
      // the part after "@" is the image digest
      const digest = rev.spec.containers[0].image?.match(/(?<=@)[^\/]+$/)?.[0];
      if (!digest) {
        throw new Error('found no image digest for revision');
      }
      imageDigestsToKeep.add(digest);
    }
  }

  console.log('count of images in use', imageDigestsToKeep.size);

  const {token} = await authClient.getAccessToken();

  // clean up gcr lit-dev images that are no longer used
  {
    console.log('fetching images from gcr');
    const resp = await request({
      url: `https://us.gcr.io/v2/${PROJECT_ID}/${REPO_NAME}/lit-dev/tags/list`,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const data = resp.data as {
      manifest: Record<string, {tag: string[]; timeCreatedMs: string}>;
      tags: string[];
    };

    for (const [digest, manifest] of Object.entries(data.manifest)) {
      if (
        !imageDigestsToKeep.has(digest) &&
        // in case image was just created without a revision associated with it
        new Date(manifest.timeCreatedMs) < ONE_WEEK_AGO
      ) {
        for (const tag of manifest.tag) {
          console.log(`deleting tag ${tag}`);
          await request({
            url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/manifests/${tag}`,
            method: 'DELETE',
            headers: {
              authorization: 'Bearer ' + token,
            },
          });
        }
        console.log(`deleting image ${digest}`);
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

  // clean up gcr lit-dev/cache images created by kaniko
  {
    const resp = await request({
      url: `https://us.gcr.io/v2/${PROJECT_ID}/${REPO_NAME}/lit-dev/cache/tags/list`,
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + token,
      },
    });

    const data = resp.data as {
      manifest: Record<string, {tag: string[]; timeCreatedMs: string}>;
      tags: string[];
    };

    for (const [digest, manifest] of Object.entries(data.manifest)) {
      if (new Date(Number(manifest.timeCreatedMs)) < ONE_WEEK_AGO) {
        for (const tag of manifest.tag) {
          console.log(`deleting tag ${tag}`);
          await request({
            url: `https://us.gcr.io/v2/lit-dev-site/lit.dev/lit-dev/cache/manifests/${digest}`,
            method: 'DELETE',
            headers: {
              authorization: 'Bearer ' + token,
            },
          });
        }
        console.log(`deleting image ${digest}`);
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

  console.log('all done!');
}

main();
