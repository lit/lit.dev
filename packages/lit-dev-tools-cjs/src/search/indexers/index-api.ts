/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import {docIndexer, UrlToFile, walkDir} from './utils.js';
import path from 'path';

export const indexApi = async (outputDir: string, idOffset = 0) => {
  // Root path of the starting point for indexing.
  const API_PATH = path.resolve(
    __dirname,
    // Load the unversioned api content.
    `../../../../lit-dev-content/${outputDir}/docs/api`
  );

  const relativeLinksToHTMLFile: UrlToFile = await walkDir(
    API_PATH,
    new Map(),
    outputDir
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'api', type: 'API'},
    idOffset
  );
};
