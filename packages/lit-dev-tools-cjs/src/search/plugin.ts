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
  indexVideos,
  indexExternalData,
} from './indexers/index.js';

/**
 * Generic that describes the type of document.
 */
export interface DocType<U extends string> {
  type: string;
  tag: U;
}

/**
 * The types of documents we index. Used to generate the search tags on the
 * frontend and used to re-rank results on the frontend.
 */
type DocTypes =
  | DocType<'article'>
  | DocType<'tutorial'>
  | DocType<'docs'>
  | DocType<'api'>
  | DocType<'video'>
  | DocType<'other'>;

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
  isExternal?: boolean;
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

  idOffset = Number(tutorials[tutorials.length - 1].objectID);
  const videos: UserFacingPageData[] = await indexVideos(outputDir, idOffset);

  idOffset = Number(videos[videos.length - 1].objectID);
  const externalSearchData: UserFacingPageData[] = await indexExternalData(
    outputDir,
    idOffset
  );

  const searchIndex: UserFacingPageData[] = [
    ...docs,
    ...articles,
    ...api,
    ...tutorials,
    ...videos,
    ...externalSearchData,
  ];

  fs.writeFileSync(OUT_PATH, JSON.stringify(searchIndex));
}
