/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import path from 'path';
import {docIndexer, UrlToFile, walkDir} from './utils';

export const indexDocs = async (outputDir: string, idOffset = 0) => {
  // Root path of the starting point for indexing.
  const DOCS_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/docs`
  );

  /**
   * Determine which directories not to index.
   */
  const skipFiles = (filepath: string) => {
    const badPathParts = [
      // these are not
      ['docs', 'internal'],
      ['docs', 'v1'],
      ['docs', 'api'],
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
    DOCS_PATH,
    new Map(),
    outputDir,
    skipFiles
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'docs', type: 'Docs'},
    idOffset
  );
};
