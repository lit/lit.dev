/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {docIndexer, UrlToFile, walkDir} from './utils.js';
import path from 'path';

export const indexArticles = async (outputDir: string, idOffset = 0) => {
  // Root path of the starting point for indexing.
  const ARTICLES_PATH = path.resolve(
    __dirname,
    // Load the article content itself not the tags pages.
    `../../../../lit-dev-content/${outputDir}/articles`
  );

  /**
   * Determine which directories not to index.
   */
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

  const relativeLinksToHTMLFile: UrlToFile = await walkDir(
    ARTICLES_PATH,
    new Map(),
    outputDir,
    skipFiles
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'article', type: 'Article'},
    idOffset
  );
};
