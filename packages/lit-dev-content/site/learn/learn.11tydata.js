/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const { existsSync } = require('fs');

const rootSiteDir = path.resolve(
  __dirname,
  '..',
);

const cleanUpTutorialData = (tutorials) => {
  return tutorials.map(tutorial => {
    const data = {
      kind: 'tutorial',
      ...tutorial,
      url: `/tutorials/${tutorial.location}/`,
    };

    // Clean up the data
    data.title = data.header;
    data.summary = data.description;
    data.date = new Date(data.date);
    data.thumbnail = data.thumbnail ?? '/images/learn/tutorial_default_thumbnail';
    delete data.description;
    delete data.header;
    delete data.steps;
    return data;
  });
};

const loadArticleData = (articles) => {
  return articles.map((article) => {
    return {
      kind: 'article',
      url: article.page.url,
      date: new Date(article.data.publishDate),
      ...article.data,
    };
  })
};

/**
 * 11ty data JS loader.
 *
 * @returns {Promise<{eleventyComputed: {tutorials: Object[]}}>} 11ty data
 *   To be consumed by the tutorials catalog (/tutorials/index.html).
 */
module.exports = {eleventyComputed: {learn: async (data) => {
  const tutorials = cleanUpTutorialData(data.tutorials);
  const articles = loadArticleData(data.collections.articles);
  const videos = data.videos;

  const learn = [tutorials, articles, videos].flat();
  // Sort based on date.
  learn.sort(({ date: dateA }, { date: dateB }) => dateB - dateA);

  // Validate the correct content exists for each content type.
  learn.forEach(content => {
    const {
      title,
      summary,
      kind,
      url,
      date
    } = content;
    if (!title || !summary || !['article', 'tutorial', 'video'].includes(kind) || !url || !date) {
      throw new Error(`Invalid content shape for: ${JSON.stringify(content)}`);
    }
    if (kind === "tutorial") {
      const { difficulty, duration } = content;
      if (!difficulty || !duration) {
        throw new Error(`Invalid tutorial shape. Missing difficulty or duration in '${JSON.stringify(content)}'`);
      }
    }
    if (kind === "article" || kind === "tutorial") {
      const { thumbnail } = content;
      if (thumbnail) {
        // An article or tutorial can optionally provide an image thumbnail
        // (without a suffix).
        const expectedImages = [
          `${thumbnail}_2x.jpg`,
          `${thumbnail}.jpg`
        ];
        expectedImages.forEach(validateImageExists);
      }
    }
    if (kind === "video") {
      const { youtubeId } = content;
      // The learn page expects thumbnails in these two file system locations.
      const expectedImages = [
        `/images/videos/${youtubeId}_2x.jpg`,
        `/images/videos/${youtubeId}.jpg`
      ];
      expectedImages.forEach(validateImageExists);
    }
  })

  return learn;
}}};

/**
 * validateImage ensures an image exists in the correct location so it can be
 * displayed on the learn page.
 *
 * Note, the image with suffix `_2.jpg` should have dimensions 1280px by 720px,
 * otherwise the image should have dimensions 640px by 360px.
 *
 * @param {string} path an absolute path to the image, e.g. "/images/videos/xyz_2.jpg"
 */
function validateImageExists(imgPath) {
  const absoluteImgPath = path.join(rootSiteDir, imgPath);
  if (existsSync(absoluteImgPath)) {
    return;
  }
  throw new Error(`Build error: expected that image '${absoluteImgPath}' exists.`);
}