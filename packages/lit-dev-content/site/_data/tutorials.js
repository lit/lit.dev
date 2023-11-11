/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * 11ty metadata for rendering the featured section in the tutorial catalog.
 *
 * @typedef {{position: number}} FeaturedOptions
 */

/**
 * Options for Loading Tutorial Metadata passed to 11ty's data rendering system.
 * @typedef {{
 *  featured: FeaturedOptions,
 * }} LoadDataOptions
 */

/** @type{LoadDataOptions} */
const defaultOptions = {featured: {position: undefined}};

/**
 * Given a dirname, will load the tutorial's tutorial.json and description.md,
 * files and return a full tutorial data object.
 *
 * @param {string} dirname Name of the tutorial's directory in /samples
 * @param {Partial<LoadDataOptions>=} Options for loading data.
 * @returns {Promise<Object>} Tutorial data to be consumed by
 *     /tutorials/index.html
 */
const loadTutorialData = async (dirname, options = defaultOptions) => {
  options = {...defaultOptions, ...options};
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
  return {...options, ...JSON.parse(manifest), description, location: dirname};
};

/**
 * 11ty data JS loader.
 *
 * @returns {Promise<{eleventyComputed: {tutorials: Object[]}}>} 11ty data
 *   To be consumed by the tutorials catalog (/tutorials/index.html).
 */
module.exports = async () => {
  /*
   * tutorial data in order of rendering on the page plus stringified JSON for
   * search indexing.
   */
  return await Promise.all([
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
};
