/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fileURLToPath} from 'url';
import * as pathlib from 'path';
import {readFileSync} from 'fs';
import * as fs from 'fs/promises';

const THIS_DIR = pathlib.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = pathlib.resolve(THIS_DIR, '..', '..', '..');
const CONTENT_PKG = pathlib.resolve(REPO_ROOT, 'packages', 'lit-dev-content');
const SITE_JSON = pathlib.resolve(CONTENT_PKG, 'site', 'site.json');

interface SiteJSON {
  latestVersion: 'v1' | 'v2' | 'v3';
}

type EleventyFrontMatterData = string[];

const SITE_LATEST_VERSION = (
  JSON.parse(readFileSync(SITE_JSON, 'utf8')) as SiteJSON
).latestVersion;
const LATEST_VERSION_CONTENT = pathlib.resolve(
  CONTENT_PKG,
  'site',
  'docs',
  SITE_LATEST_VERSION
);
const UNVERSIONED_VERSION_LOCATION = pathlib.resolve(
  CONTENT_PKG,
  'site',
  'docs',
  'unversioned'
);

/**
 * This script builds our unversioned latest documentation for lit.dev. It
 * locates the current latestVersion of Lit to show from `site.json`, then
 * copies that documentation from the versioned subdirectory into an unversioned
 * subdirectory.
 *
 * The following transforms are then applied on the files:
 *   - Permalink frontmatter is added to strip the version from the URL. E.g.,
 *     /docs/v3/* becomes /docs/*.
 *  - `api.html` has frontmatter transformed so base api paths become
 *    unversioned.
 *  - The latest version `v[N].json` file is renamed `unversioned.json` so it
 *    matches the directory name which contains it.
 */
const buildAndTransformUnverionedDocs = async () => {
  const walk = async (dirPath: string): Promise<void> => {
    const entries = await fs.readdir(dirPath, {withFileTypes: true});
    await Promise.all(
      entries.map(async (entry) => {
        const childPath = pathlib.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          return walk(childPath);
        } else {
          return transformFile(childPath);
        }
      })
    );
  };

  console.log('Starting build-unversioned-docs.js script');
  await walk(LATEST_VERSION_CONTENT);
  console.log('Completed build-unversioned-docs.js script');
};

/**
 * Transform the given versioned content file and copy it to the unversioned
 * directory.
 */
async function transformFile(path: string) {
  const relativeChildPath = pathlib.relative(LATEST_VERSION_CONTENT, path);
  const ext = pathlib.extname(relativeChildPath);
  const relativeChildPathWithoutExt = relativeChildPath.slice(0, -ext.length);
  const fileBasename = pathlib.basename(relativeChildPath, ext);

  let fileContents = await fs.readFile(path, {encoding: 'utf8'});
  let unversionedLocation = pathlib.join(
    UNVERSIONED_VERSION_LOCATION,
    relativeChildPath
  );
  switch (ext) {
    case '.md':
      const [frontMatterData, restOfFile] = getFrontMatterData(fileContents);
      const hasExistingPermalink = frontMatterData.find((val) =>
        val.includes('permalink:')
      );
      if (hasExistingPermalink) {
        throw new Error(
          `Unhandled case: Handle existing permalink in '${path}'`
        );
      }
      if (fileBasename === 'index') {
        frontMatterData.push(
          `permalink: docs/${relativeChildPathWithoutExt}.html`
        );
      } else {
        frontMatterData.push(
          `permalink: docs/${relativeChildPathWithoutExt}/index.html`
        );
      }

      fileContents = writeFrontMatter(frontMatterData) + restOfFile;
      break;
    case '.json':
      // Only handle the latest version json file. E.g., `v[N].json` which needs
      // to match its directory name. Therefore the latest json file will need
      // to be renamed to `unversioned.json` as it is being moved to the
      // `unversioned` subdirectory. All other json files will continue to match
      // their directory name.
      if (fileBasename === SITE_LATEST_VERSION) {
        unversionedLocation = pathlib.join(
          pathlib.dirname(unversionedLocation),
          'unversioned.json'
        );
        fileContents = JSON.stringify({
          collection: 'docs-unversioned',
          latestVersion: SITE_LATEST_VERSION,
        });
      }
      break;
    case '.html':
      // api.html is an html file containing only front matter data used to
      // generate the API documentation. It contains the versioned api base
      // paths. This transform makes the api base path unversioned.
      if (fileBasename === 'api') {
        const [frontMatterData] = getFrontMatterData(fileContents);
        const transformedFrontMatter = frontMatterData.map((line) => {
          return line.replace(`/${SITE_LATEST_VERSION}/`, '/');
        });
        fileContents = writeFrontMatter(transformedFrontMatter);
      } else {
        throw new Error(`Unhandled html document: '${path}'`);
      }
      break;
    default:
      throw new Error(`Unhandled extension '${ext}' for '${path}'`);
  }

  console.log(
    `Writing: ${pathlib.relative(
      CONTENT_PKG,
      unversionedLocation
    )} from ${pathlib.relative(CONTENT_PKG, path)}`
  );
  await fs.mkdir(pathlib.dirname(unversionedLocation), {recursive: true});
  await fs.writeFile(unversionedLocation, fileContents);
}

/**
 * Retrieve the 11ty frontmatter from our docs. This is not a full fledged YAML
 * parser.
 */
function getFrontMatterData(
  fileData: string
): [EleventyFrontMatterData, string] {
  const splitFile = fileData.split(/^---$/m);
  const frontMatterData = splitFile[1].split('\n').slice(1, -1);
  const restOfFile = splitFile.slice(2).join('---');
  return [frontMatterData, restOfFile];
}

function writeFrontMatter(frontmatter: EleventyFrontMatterData): string {
  return '---\n' + frontmatter.join('\n') + '\n---';
}

buildAndTransformUnverionedDocs();
