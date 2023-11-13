/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {UserFacingPageData} from '../plugin';

export async function indexVideos(outputDir: '_dev' | '_site', idOffset = 0) {
  if (outputDir === '_dev') {
    return [];
  }

  // Path of the video index.
  const VIDEO_INDEX_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/external-search-data/videos.json`
  );

  const fileContents = await fs.readFile(VIDEO_INDEX_PATH, 'utf-8');
  const videos = JSON.parse(fileContents) as UserFacingPageData[];
  videos.forEach((video) => {
    video.objectID = `${++idOffset}`;
  });

  return videos;
}
