/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';
import Minisearch from 'minisearch';

import {PageSearchChunker} from './PageSearchChunker.js';

/**
 * Map associating relative site url to the file path of the index.html file.
 */
type UrlToFile = Map<string, string>;

/**
 * Data indexed in Minisearch.
 */
interface UserFacingPageData {
  id: string;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  isSubsection: boolean;
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

  /**
   * NOTE: The minisearch options must exactly match when we create the search
   * index on the client. Any changes here must be reflected in the
   * `litdev-search.ts` component.
   */
  const searchIndex = new Minisearch<UserFacingPageData>({
    idField: 'id',
    fields: ['title', 'heading', 'text'],
    storeFields: ['title', 'heading', 'relativeUrl', 'isSubsection'],
    searchOptions: {
      boost: {title: 1.4, heading: 1.2, text: 1},
      prefix: true,
      fuzzy: 0.2,
    },
  });

  let id = 0;
  for (const [relUrl, filePath] of relativeDocUrlsToHtmlFile.entries()) {
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
      for (const pageChunk of sanitizedPageChunks) {
        const {title, heading, fragment, text} = pageChunk;

        // Filter out "See also" heading that always shows up because it's full
        // of keywords and links.
        if (heading === 'See also') {
          continue;
        }

        // Populate the search index. This is the text we fuzzy search and user
        // facing data to display in the suggested results.
        searchIndex.add({
          id: `${id++}`,
          title: title.replace(/ – Lit$/, ''),
          heading,
          relativeUrl: relUrl.replace(/index.html$/, '') + (fragment ?? ''),
          text: text,
          isSubsection: !!fragment,
        });
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
 * @returns mapping between lit.dev relative url and index.html file paths.
 */
function walkDir(dir: string, results: UrlToFile): UrlToFile {
  const dirContents = fs.readdirSync(dir);
  for (const contents of dirContents) {
    if (path.extname(contents) === '.html') {
      const relPathBase = dir.match(/\/docs.*/)?.[0];
      if (!relPathBase) {
        throw new Error(`Failed to match relative path.`);
      }
      const relPath = `${relPathBase}/${contents}`;
      results.set(relPath, path.resolve(dir, contents));
    } else if (path.extname(contents) === '') {
      walkDir(path.resolve(dir, contents), results);
    }
  }
  return results;
}
