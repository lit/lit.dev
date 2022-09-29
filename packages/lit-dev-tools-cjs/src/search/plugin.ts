/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';

import {PageSearchChunker} from './PageSearchChunker.js';

/**
 * Map associating relative site url to the file path of the index.html file.
 */
type UrlToFile = Map<string, string>;

/**
 * Generic that describes the type of document.
 */
interface DocType<T extends string, U extends string> {
  type: T;
  tag: U;
}

/**
 * The types of documents we index. Used to generate the search tags on the
 * frontend and used to re-rank results on the frontend.
 */
type DocTypes =
  | DocType<'Article', 'article'>
  | DocType<'Tutorial', 'tutorial'>
  | DocType<'Docs', 'docs'>
  | DocType<'API', 'api'>
  | DocType<'Other', 'other'>;

/**
 * Shape of an Algolia search index record.
 */
interface UserFacingPageData {
  objectID: string;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  parentID?: string;
  docType: DocTypes;
}

/**
 * Plugin that scans and indexes the lit.dev /docs directory into a search index
 * that can be used to search the website. The search index is written to
 * `/searchIndex.json`. This is accessible by the client via:
 * `https://lit.dev/searchIndex.json`.
 */
export async function createSearchIndex(outputDir: '_dev' | '_site') {
  // Path to root documentation path, configurable so we can search _dev or _site.
  const DOCS_PATH = path.resolve(
    __dirname,
    `../../../lit-dev-content/${outputDir}/docs`
  );
  const relativeDocUrlsToHtmlFile: UrlToFile = walkDir(DOCS_PATH, new Map());

  const ARTICLES_PATH = path.resolve(
    __dirname,
    // Load the article content itself not the tags pages.
    `../../../lit-dev-content/${outputDir}/articles`
  );

  const skipFiles = (filepath: string) => {
    // These pages are tag feeds and are not structured in a way the
    // search indexer can understand.
    const badPathParts = [
      ['articles', 'tags'],
      ['articles', 'index.html'],
      // Articles are hoisted to /article/article-name/index.html for url
      // readability. This file exists only for 11ty navigation plugin.
      ['articles', 'article'],
    ];
    if (
      badPathParts.some((badPathpart) => {
        const badPath = path.join(...badPathpart);
        return filepath.includes(badPath);
      })
    ) {
      return true;
    }

    return false;
  };

  const relativeLinksToHTMLFile: UrlToFile = walkDir(
    ARTICLES_PATH,
    relativeDocUrlsToHtmlFile,
    skipFiles
  );

  let id = 0;
  const searchIndex: UserFacingPageData[] = [];
  for (const [relUrl, filePath] of relativeLinksToHTMLFile.entries()) {
    if (filePath.includes('/internal/')) {
      // Skip internal pages.
      continue;
    }
    if (filePath.includes('/docs/v1')) {
      // Don't index the old versions of the docs.
      // TODO(aomarks) In theory we could switch between two different versions
      // of the search index, but it might not be worth the complexity.
      continue;
    }

    const pageContent = fs.readFileSync(filePath, {encoding: 'utf8'});
    try {
      const pageToChunk = new PageSearchChunker(pageContent);
      const sanitizedPageChunks = pageToChunk.pageSearchChunks();

      // Expect each page be searchable
      if (sanitizedPageChunks.length === 0) {
        throw new Error(`No search chunks found for ${relUrl}`);
      }

      const parents = sanitizedPageChunks.filter((chunk) => chunk.isParent);

      // Expect only one h1 per page. Used to create the "document" record in
      // the search interface.
      if (parents.length !== 1) {
        throw new Error(
          `Error finding parent page chunk for ${relUrl}. Potential parent chunks found: ${parents.length}`
        );
      }

      const parent = parents[0];
      const parentID = id;

      // Expect the parent to be the first chunk so that we can ensure that
      // parentID is indeed the current id.
      if (parent !== sanitizedPageChunks[0]) {
        throw new Error(
          `Parent page chunk for ${relUrl} was not the first chunk.`
        );
      }

      for (const pageChunk of sanitizedPageChunks) {
        const {title, heading, fragment, text} = pageChunk;

        // Filter out "See also" heading that always shows up because it's full
        // of keywords and links.
        if (heading === 'See also') {
          continue;
        }

        const isArticle = filePath.includes('/articles/');
        const isApi = filePath.includes('/docs/api/');
        let docType: DocTypes = {
          tag: 'docs',
          type: 'Docs',
        };

        if (isArticle) {
          docType = {
            tag: 'article',
            type: 'Article',
          };
        } else if (isApi) {
          docType = {
            tag: 'api',
            type: 'API',
          };
        }

        const entry: UserFacingPageData = {
          objectID: `${id++}`,
          title: title.replace(/ – Lit$/, ''),
          heading,
          relativeUrl: relUrl.replace(/index.html$/, '') + (fragment ?? ''),
          text: text,
          docType,
        };

        if (pageChunk !== parent) {
          entry.parentID = `${parentID}`;
        }

        // Populate the search index.
        searchIndex.push(entry);
      }
    } catch (e: unknown) {
      throw new Error(
        `Failure while creating search index for page ` +
          `'${relUrl}': ${(e as Error).message}`
      );
    }
  }

  fs.writeFileSync(
    path.resolve(DOCS_PATH, '../searchIndex.json'),
    JSON.stringify(searchIndex)
  );
}

/**
 * Populate a results map with all lit.dev static index.html pages and their
 * relative url paths.
 *
 * @param dir Directory to recursively walk
 * @param results Map we're mutating with relative url and absolute path.
 * @param shouldSkip Function that takes an absolute OS filepath and returns whether or not it should be indexed.
 * @returns mapping between lit.dev relative url and index.html file paths.
 */
function walkDir(
  dir: string,
  results: UrlToFile,
  shouldSkip = (_path: string) => false
): UrlToFile {
  const dirContents = fs.readdirSync(dir);
  for (const contents of dirContents) {
    if (shouldSkip(path.join(dir, contents))) {
      continue;
    }
    if (path.extname(contents) === '.html') {
      const relPathBase = dir.match(/(\/docs.*)|(\/articles.*)/)?.[0];
      if (!relPathBase) {
        throw new Error(`Failed to match relative path.`);
      }
      const relPath = `${relPathBase}/${contents}`;
      results.set(relPath, path.resolve(dir, contents));
    } else if (path.extname(contents) === '') {
      walkDir(path.resolve(dir, contents), results, shouldSkip);
    }
  }
  return results;
}
