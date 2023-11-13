/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {UserFacingPageData} from '../plugin';

export async function indexExternalData(
  outputDir: '_dev' | '_site',
  idOffset = 0
) {
  if (outputDir === '_dev') {
    return [];
  }

  // Path of the external data index.
  const EXTERNAL_DATA_INDEX_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/external-search-data/data.json`
  );

  const fileContents = await fs.readFile(EXTERNAL_DATA_INDEX_PATH, 'utf-8');
  const data = JSON.parse(fileContents) as UserFacingPageData[];
  data.forEach((searchRecord) => {
    searchRecord.objectID = `${++idOffset}`;
    searchRecord.isExternal = true;
  });

  return data;
}
