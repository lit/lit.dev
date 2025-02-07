/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {UserFacingPageData} from '../plugin';

interface KeywordRecord {
  urls: string[];
  keywords: string[];
}

interface KeywordModifiers {
  keywords: KeywordRecord[];
}

/**
 * Adds keyword metadata to pages in the search index based on keyword modifiers defined in a JSON file.
 * Only processes keywords for production builds (when outputDir is '_site').
 *
 * @param outputDir - The output directory for the build ('_dev' or '_site'). Keywords are only added for '_site' builds.
 * @param index - Array of page data objects to be enhanced with keywords
 * @returns The modified index array with keywords added to relevant pages. Returns empty array for dev builds.
 */
export async function addKeywords(
  outputDir: '_dev' | '_site',
  index: UserFacingPageData[]
) {
  if (outputDir === '_dev') {
    return index;
  }

  // Path to the keyword modifiers JSON file.
  const KEYWORD_MODIFIERS_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/search-modifiers/keywords.json`
  );

  const fileContents = await fs.readFile(KEYWORD_MODIFIERS_PATH, 'utf-8');
  const data = JSON.parse(fileContents) as KeywordModifiers;

  const keywordMap = new Map<string, Set<string>>();

  // Create a map of urls to keywords associated with that url.
  for (const keywordRecord of data.keywords) {
    const keywords = new Set(keywordRecord.keywords);

    for (const url of keywordRecord.urls) {
      let keywordsForURL = keywordMap.get(url);
      if (!keywordsForURL) {
        keywordsForURL = new Set<string>();
        keywordMap.set(url, keywordsForURL);
      }

      for (const keyword of keywords) {
        keywordsForURL.add(keyword);
      }
    }
  }

  // Add keywords to the index to each url that has keywords associated with it.
  for (const page of index) {
    const keywords = keywordMap.get(page.relativeUrl);
    if (keywords) {
      page.keywords = Array.from(keywords);
    }
  }

  return index;
}
