/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');


const loadTutorialData = async (dirname,) => {
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
    location: dirname,
  };

  // Clean up the data
  data.title = data.header;
  data.summary = data.description;
  delete data.description;
  delete data.header;
  delete data.steps;
  return data;
};

/**
 * 
Example `.data` of an article.
{
    title: 'Lit for Polymer users',
    publishDate: 2022-08-22T00:00:00.000Z,
    lastUpdated: 2022-08-22T00:00:00.000Z,
    summary: 'Moving your code from Polymer to Lit.',
    tags: [ 'web-components' ],
    eleventyNavigation: { parent: 'Articles', key: 'Lit for Polymer users', order: 0 },
    author: [ 'arthur-evans' ]
  }
 */

const loadArticleData = async () => {
  const articlesDir = path.resolve(__dirname, '../articles/article');
  const files = await fs.readdir(articlesDir);
  const markdownArticles = files.filter((filename) => filename.endsWith('.md'));

  const articleData = Promise.all(
    markdownArticles.map((articleFileName) =>
      fs
        .readFile(path.resolve(articlesDir, articleFileName), {
          encoding: 'utf8',
        })
        .then((contents) => matter(contents))
        .then((parsedContent) => ({kind: 'article', ...parsedContent.data}))
    )
  );
  return articleData;
};

// Note: Img can be obtained with: https://i.ytimg.com/vi_webp/<video id>/mqdefault.webp
// or https://i.ytimg.com/vi/<video id>/mqdefault.jpg
const loadVideoData = () =>
  [
    {
      title: 'Chat with Lit #1 – Westbrook Johnson (Adobe) ',
      summary: `Chat With Lit is the Lit team's live-recorded Twitter Space series hosted by Rody Davis (@rodydavis) and Elliott Marquez (@techytacos) from Google. This is the first Twitter Space featuring Westbrook Johnson (@WestbrookJ) from Adobe.`,
      youtubeId: 'it-NXhxkOJo',
    },
    {
      title: 'Welcome to Lit!',
      summary: `Welcome to the Lit YouTube channel! Whether you are a newcomer to Lit or a seasoned veteran, there’s a series for you to learn and expand your skills to build fast, lightweight web components.`,
      youtubeId: 'N6EQOl8maPk',
    },
    {
      title: 'How to build your first Lit component',
      summary: `Learn how to build your first Lit component and use it with React, Vue, and in a markdown editor. Lit Software Engineer Andrew Jakubowicz explains core Lit concepts, the LitElement lifecycle, attributes, state, styles, events, and more!`,
      youtubeId: 'QBa1_QQnRcs',
    },
    {
      title: 'What are elements - Lit University (Basics)',
      summary: `Software Engineer Elliott Marquez shares what elements are, how to make, and interact with them. Learn about the basic building block of the web in this video!`,
      youtubeId: 'x_mixcGEia4',
    },
    {
      title: 'How to build a carousel in Lit',
      summary: `In this video, we build a simple-carousel using Lit, letting us explore passing child DOM (Document Object Model) into your web component and some simple web component composition.`,
      youtubeId: '2RftvylEtrE',
    },
    {
      title:
        'Event communication between web components - Lit University (Advanced)',
      summary: `Follow along as Lit Software Engineer Elliott Marquez shares the pros, cons, and use cases of communicating with events.`,
      youtubeId: 'T9mxtnoy9Qw',
    },
    {
      title: 'How to style your Lit elements',
      summary: `How do you style a web component to suit your needs? In this episode, Lit Software Engineer Andrew Jakubowicz explains how the Shadow DOM works, illustrates the benefits of encapsulated CSS, and shows how you can use CSS inheritance, custom properties and shadow parts to build web components with flexible, public styling APIs.`,
      youtubeId: 'Xt7blcyuw5s',
    },
    {
      title: 'Introduction to Lit - Lit University (Basics)',
      summary: `Learn all about the Lit library in this beginner-friendly Lit University episode! We will cover all of the essentials, including custom elements, declarative templates, scoped styles, and reactive properties. Find out why Lit is so awesome for creating shareable components, design systems, and full-fledged applications. `,
      youtubeId: 'uzFakwHaSmw',
    },
  ].map((videoData) => ({kind: 'video', ...videoData}));

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
    loadTutorialData('wc-to-lit'),
  ]);

  const articles = await loadArticleData();
  const videos = loadVideoData();

  const learn = [tutorials, articles, videos].flat()

  // TODO: Validate data here to ensure shape of data for each kind is correct.
  // TODO: How do we order the content?

  /*
   * All the content to put on the learn page.
   */
  return {eleventyComputed: {learn}};
};
