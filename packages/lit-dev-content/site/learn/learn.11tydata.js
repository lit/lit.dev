/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { existsSync } = require('fs');

const rootSiteDir = path.resolve(
  __dirname,
  '..',
);

const loadTutorialData = async (dirname) => {
  const tutorialDir = path.resolve(
    __dirname,
    '../../samples/tutorials',
    dirname
  );
  const encoding = {encoding: 'utf8'};

  const manifestProm = fs.readFile(
    path.join(tutorialDir, 'tutorial.json'),
    encoding
  );
  const descriptionProm = fs.readFile(
    path.join(tutorialDir, 'description.md'),
    encoding
  );
  const [manifest, description] = await Promise.all([
    manifestProm,
    descriptionProm,
  ]);
  const data = {
    kind: 'tutorial',
    ...JSON.parse(manifest),
    description,
    url: `/tutorials/${dirname}/`,
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
};

const loadArticleData = async () => {
  const articlesDir = path.resolve(__dirname, '../articles/article');
  const files = await fs.readdir(articlesDir);
  const markdownArticles = files.filter((filename) => filename.endsWith('.md'));

  const articleData = Promise.all(
    markdownArticles.map(async (articleFileName) => {
      const contents = await fs.readFile(
        path.resolve(articlesDir, articleFileName),
        {
          encoding: 'utf8',
        }
      );
      const frontMatter = matter(contents);
      return {
        kind: 'article',
        url: `/articles/${articleFileName.slice(0, -3)}/`,
        date: new Date(frontMatter.publishDate),
        ...frontMatter.data,
      };
    })
  );
  return articleData;
};

// Note: YouTube thumbnail images can be obtained with
// https://i.ytimg.com/vi/<video id>/maxresdefault.jpg It should then be checked
// into the GitHub repository at the native size 1280px by 720px, under the name
// `images/videos/<video id>_2x.jpg`. Then also check-in a halved resolution
// 640px by 360px image under the name `images/videos/<video id>.jpg`.
//
// Use https://squoosh.app/ to create the halved resolution image.
const loadVideoData = () =>
  [
    {
      title: 'Declarative Reactive Web Components with Justin Fagnani',
      summary: `Justin covers what Web Components are and how LitElement and lit-html add value on top of the native APIs. This talk covers the fundamentals of how and why Lit is architected the way it is.`,
      youtubeId: '9FB0GSOAESo',
      date: "Jun 22 2019",
    },
    {
      title: 'Chat with Lit #1 – Westbrook Johnson (Adobe)',
      summary: `Listen in on this live-recorded Twitter Space episode, hosted by Rody Davis (@rodydavis) and Elliott Marquez (@techytacos), with guest Westbrook Johnson (@WestbrookJ) from Adobe.`,
      youtubeId: 'it-NXhxkOJo',
      date: "Jul 23 2021",
    },
    {
      title: 'Lit 2.0 Release Livestream',
      summary: `Lit 2.0 has officially landed! Here we talk about Lit 2.0, what we've been doing, what it means to Google, and what's new. Stay tuned for a panel discussion with Lit users in the industry!`,
      youtubeId: 'nfb779XIhsU',
      date: "Sep 21 2021",
    },
    {
      title: 'How to build your first Lit component',
      summary: `Learn how to build your first Lit component and use it with React, Vue, and in a markdown editor.`,
      youtubeId: 'QBa1_QQnRcs',
      date: "Apr 25 2022",
    },
    {
      title: 'What are elements?',
      summary: `Software Engineer Elliott Marquez shares what elements are, how to make, and interact with them. Learn about the basic building block of the web in this video!`,
      youtubeId: 'x_mixcGEia4',
      date: "Apr 27 2022",
    },
    {
      title: 'How to build a carousel in Lit',
      summary: `In this video, we build a simple-carousel using Lit, letting us explore passing children into your web component, and web component composition.`,
      youtubeId: '2RftvylEtrE',
      date: "May 3 2022",
    },
    {
      title:
        'Event communication between web components',
      summary: `Follow along as Lit Software Engineer Elliott Marquez shares the pros, cons, and use cases of communicating with events.`,
      youtubeId: 'T9mxtnoy9Qw',
      date: "May 5 2022",
    },
    {
      title: 'How to style your Lit elements',
      summary: `We cover how the Shadow DOM works, illustrate the benefits of encapsulated CSS, and show you how to use CSS inheritance, custom properties and shadow parts to expose a flexible public styling API.`,
      youtubeId: 'Xt7blcyuw5s',
      date: "Oct 3 2022",
    },
    {
      title: 'Introduction to Lit',
      summary: `Learn all about the Lit library in this beginner-friendly Lit University episode! We will cover all of the essentials, including custom elements, declarative templates, scoped styles, and reactive properties.`,
      youtubeId: 'uzFakwHaSmw',
      date: "Nov 2 2022",
    },
    {
      title: 'Lit 3.0 Launch Event',
      summary: `Join the Lit team to hear all about the Lit 3.0 release and what's new in the Lit ecosystem!`,
      youtubeId: 'ri9FEl_hRTc',
      date: "Oct 10 2023",
    },
  ].map((videoData) => ({
    kind: 'video',
    url: `https://www.youtube.com/watch?v=${videoData.youtubeId}`,
    ...videoData,
    date: new Date(videoData.date),
  }));

/**
 * 11ty data JS loader.
 *
 * @returns {Promise<{eleventyComputed: {tutorials: Object[]}}>} 11ty data
 *   To be consumed by the tutorials catalog (/tutorials/index.html).
 */
module.exports = async () => {
  const tutorials = await Promise.all([
    // Learn
    loadTutorialData('intro-to-lit', {featured: {position: 0}}),
    loadTutorialData('working-with-lists', {featured: {position: 1}}),
    loadTutorialData('reactivity'),
    loadTutorialData('custom-attribute-converter'),
    loadTutorialData('async-directive'),

    // Build
    loadTutorialData('svg-templates'),
    loadTutorialData('tooltip'),
    loadTutorialData('carousel', {featured: {position: 2}}),
    loadTutorialData('word-viewer'),

    // Draft
    // loadTutorialData('wc-to-lit'),
  ]);
  const articles = await loadArticleData();
  const videos = loadVideoData();

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

  /*
   * All the content to put on the learn page.
   */
  return {eleventyComputed: {learn}};
};

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