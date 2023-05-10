/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {fileURLToPath} from 'url';
import * as pathlib from 'path';
import * as fs from 'fs';
import * as fsPromise from 'fs/promises';

const THIS_DIR = pathlib.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = pathlib.resolve(THIS_DIR, '..', '..', '..');
const CONTENT_PKG = pathlib.resolve(REPO_ROOT, 'packages', 'lit-dev-content');
const SITE_JSON = pathlib.resolve(CONTENT_PKG, 'site', 'site.json');

interface SiteJSON {
  latestVersion: 'v1' | 'v2';
}

type EleventyFrontMatterData = string[];

const SITE_LATEST_VERSION = (
  JSON.parse(fs.readFileSync(SITE_JSON, 'utf8')) as SiteJSON
).latestVersion;
const LATEST_VERSION_CONTENT = pathlib.resolve(
  CONTENT_PKG,
  'site',
  'docs',
  SITE_LATEST_VERSION
);
console.log(LATEST_VERSION_CONTENT);
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
 *     /docs/v2/* becomes /docs/*.
 *   - Versioned cross links are detected and made unversioned.
 */
const buildAndTransformUnverionedDocs = async () => {
  const walk = async (dirPath: string): Promise<void> => {
    const entries = await fsPromise.readdir(dirPath, {withFileTypes: true});
    await Promise.all(
      entries.map(async (entry) => {
        const childPath = pathlib.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          return walk(childPath);
        } else {
          transformFile(childPath);
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
function transformFile(path: string) {
  let fileContents = fs.readFileSync(path, {encoding: 'utf8'});
  const relativeChildPath = pathlib.relative(LATEST_VERSION_CONTENT, path);
  const ext = pathlib.extname(relativeChildPath);
  let unversionedLocation = pathlib.join(
    UNVERSIONED_VERSION_LOCATION,
    relativeChildPath
  );

  if (ext === '.md') {
    const fileName = pathlib.basename(unversionedLocation, '.md');
    const [frontMatterData, restOfFile] = getFrontMatterData(fileContents);
    const existingPermalink = frontMatterData.findIndex((val) =>
      val.includes('permalink:')
    );
    if (existingPermalink !== -1) {
      throw new Error(
        'Unhandled case: Handle this by transforming the permalink here.'
      );
    }
    if (fileName === 'index') {
      frontMatterData.push(
        `permalink: docs/${relativeChildPath.slice(0, -3)}.html`
      );
    } else {
      frontMatterData.push(
        `permalink: docs/${relativeChildPath.slice(0, -3)}/index.html`
      );
    }

    fileContents = writeFrontMatter(frontMatterData) + restOfFile;
  } else if (ext === '.json') {
    if (
      pathlib.basename(unversionedLocation, '.json') === SITE_LATEST_VERSION
    ) {
      unversionedLocation = pathlib.join(
        pathlib.dirname(unversionedLocation),
        'unversioned.json'
      );
      fileContents = JSON.stringify({
        collection: 'docs-unversioned',
        latestVersion: SITE_LATEST_VERSION,
      });
    }
  } else if (ext === '.html') {
    if (pathlib.basename(unversionedLocation, '.html') === 'api') {
      const [frontMatterData, _] = getFrontMatterData(fileContents);
      const transformedFrontMatter = frontMatterData.map((line) => {
        return line.replace(`/${SITE_LATEST_VERSION}/`, '/');
      });
      fileContents = writeFrontMatter(transformedFrontMatter);
    } else {
      throw new Error(`Unhandled html document: '${path}'`);
    }
  } else {
    throw new Error(`Unhandled extension '${ext}' for '${path}'`);
  }

  fs.mkdirSync(pathlib.dirname(unversionedLocation), {recursive: true});
  fs.writeFileSync(unversionedLocation, fileContents);
}

/**
 * Retrieve the 11ty frontmatter from our docs. This is not a full fledged YAML
 * parser.
 */
function getFrontMatterData(
  fileData: string
): [EleventyFrontMatterData, string] {
  const splitFile = fileData.split('---');
  const frontMatterData = splitFile[1].split('\n').slice(1, -1);
  const restOfFile = splitFile.slice(2).join('---');
  return [frontMatterData, restOfFile];
}

function writeFrontMatter(frontmatter: EleventyFrontMatterData): string {
  return '---\n' + frontmatter.join('\n') + '\n---';
}

buildAndTransformUnverionedDocs();
