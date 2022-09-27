/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import fs from 'fs';
import path from 'path';
import {
  indexDocs,
  indexArticles,
  indexApi,
  indexTutorials,
} from './indexers/index.js';

export interface DocType<T extends string, U extends string> {
  type: T;
  tag: U;
}

export type DocTypes =
  | DocType<'Article', 'article'>
  | DocType<'Tutorial', 'tutorial'>
  | DocType<'Docs', 'docs'>
  | DocType<'API', 'api'>
  | DocType<'Other', 'other'>;

/**
 * Data to be Indexed.
 */
export interface UserFacingPageData {
  id: number;
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
  const OUT_PATH = path.resolve(
    __dirname,
    `../../../lit-dev-content/${outputDir}/searchIndex.json`
  );
  const docs: UserFacingPageData[] = await indexDocs(outputDir);
  let idOffset = docs[docs.length - 1].id;
  const articles: UserFacingPageData[] = await indexArticles(
    outputDir,
    idOffset
  );
  idOffset = articles[articles.length - 1].id;
  const api: UserFacingPageData[] = await indexApi(outputDir, idOffset);
  idOffset = api[api.length - 1].id;
  const tutorials: UserFacingPageData[] = await indexTutorials(
    outputDir,
    idOffset
  );
  const searchIndex: UserFacingPageData[] = [
    ...docs,
    ...articles,
    ...api,
    ...tutorials,
  ];

  fs.writeFileSync(OUT_PATH, JSON.stringify(searchIndex));
}
