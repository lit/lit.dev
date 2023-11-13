/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import fs from 'fs/promises';
import path from 'path';
import {DocType, UserFacingPageData} from '../plugin.js';
import {PageSearchChunker} from './PageSearchChunker.js';

/**
 * Map associating relative site url to the file path of the index.html file.
 */
export type UrlToFile = Map<string, string>;

/**
 * Populate a results map with all lit.dev static index.html pages and their
 * relative url paths.
 *
 * @param dir Directory to recursively walk
 * @param results Map we're mutating with relative url and absolute path.
 * @param projectDir The root directory which to crawl.
 * @param shouldSkip Function that takes an absolute OS filepath and returns whether or not it should be indexed.
 * @returns mapping between lit.dev relative url and index.html file paths.
 */
export const walkDir = async (
  dir: string,
  results: UrlToFile,
  projectDir: string,
  shouldSkip = (_path: string) => false
): Promise<UrlToFile> => {
  const dirContents = await fs.readdir(dir);
  for (const contents of dirContents) {
    if (shouldSkip(path.join(dir, contents))) {
      continue;
    }
    if (path.extname(contents) === '.html') {
      const basePath = path.resolve(
        __dirname,
        `../../../../lit-dev-content/${projectDir}`
      );
      const relPathBase = path.relative(basePath, dir);
      const relPath = path.join(relPathBase, contents);
      results.set(relPath, path.resolve(dir, contents));
    } else if (path.extname(contents) === '') {
      await walkDir(
        path.resolve(dir, contents),
        results,
        projectDir,
        shouldSkip
      );
    }
  }

  return results;
};

/**
 * A basic indexer that can index basic pages in the form of lit.dev docs pages
 * and articles.
 *
 * @param relativeLinksToHTMLFile Map associating relative site url to the contents of the index.html file at that location.
 * @param docType The type of document we're indexing.
 * @param idOffset The offset to add to the id of each document.
 * @returns A search index for the given map of relative links to html files.
 */
export const docIndexer = async (
  relativeLinksToHTMLFile: UrlToFile,
  docType: DocType<'docs'> | DocType<'api'> | DocType<'article'>,
  idOffset: number
) => {
  let id = idOffset;
  const searchIndex: UserFacingPageData[] = [];
  for (const [relUrl, filePath] of relativeLinksToHTMLFile.entries()) {
    const pageContent = await fs.readFile(filePath, {encoding: 'utf8'});
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

        const entry: UserFacingPageData = {
          objectID: `${id++}`,
          title: title.replace(/ – Lit$/, ''),
          heading,
          relativeUrl:
            '/' + relUrl.replace(/index.html$/, '') + (fragment ?? ''),
          text: text,
          docType,
        };

        if (pageChunk !== parent) {
          entry.parentID = `${parentID}`;
        }

        // Populate the search index. This is the text we fuzzy search and user
        // facing data to display in the suggested results.
        searchIndex.push(entry);
      }
    } catch (e: unknown) {
      throw new Error(
        `Failure while creating search index for page ` +
          `'${relUrl}': ${(e as Error).message}`
      );
    }
  }

  return searchIndex;
};
