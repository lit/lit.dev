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

/**
 * Generic that describes the type of document.
 */
export interface DocType<T extends string, U extends string> {
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
export interface UserFacingPageData {
  objectID: string;
  relativeUrl: string;
  title: string;
  heading: string;
  text: string;
  parentID?: string;
  docType: DocTypes;
}

/**
 * Plugin that scans and indexes a subset of lit.dev into a search index that
 * can be used to search the website. The search index is written to
 * `/searchIndex.json`. This can be uploaded to Algolia.
 */
export async function createSearchIndex(outputDir: '_dev' | '_site') {
  const OUT_PATH = path.resolve(
    __dirname,
    `../../../lit-dev-content/${outputDir}/searchIndex.json`
  );
  const docs: UserFacingPageData[] = await indexDocs(outputDir);
  let idOffset = Number(docs[docs.length - 1].objectID);
  const articles: UserFacingPageData[] = await indexArticles(
    outputDir,
    idOffset
  );

  idOffset = Number(articles[articles.length - 1].objectID);
  const api: UserFacingPageData[] = await indexApi(outputDir, idOffset);

  idOffset = Number(api[api.length - 1].objectID);
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
