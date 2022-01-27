const fs = require('fs').promises;
const path = require('path');

/**
 * Given a dirname, will load the tutorial's tutorial.json and description.md,
 * files and return a full tutorial data object.
 *
 * @param {string} dirname Name of the tutorial's directory in /samples
 * @returns {Promise<Object>} Tutorial data to be consumed by
 *     /tutorials/index.html
 */
const loadTutorialData = async (dirname) => {
  const tutorialDir = path.resolve(__dirname, '../../samples/tutorials', dirname);
  const encoding = {encoding: 'utf8'};

  const manifestProm = fs.readFile(path.join(tutorialDir, 'tutorial.json'), encoding);
  const descriptionProm = fs.readFile(path.join(tutorialDir, 'description.md'), encoding);
  const [manifest, description] = await Promise.all([manifestProm, descriptionProm]);
  return {...JSON.parse(manifest), description, location: dirname};
};

/**
 * 11ty data JS loader.
 *
 * @returns {Promise<{eleventyComputed: {tutorials: Object[]}}>} 11ty data
 *   To be consumed by the tutorials catalog (/tutorials/index.html).
 */
module.exports = async () => {
  /*
   * tutorial data in order of rendering on the page
   */
  return {eleventyComputed: {tutorials: [
    // Learn
    await loadTutorialData('intro-to-lit'),
    await loadTutorialData('advanced-templating'),

    // Build
    await loadTutorialData('brick-viewer'),
  ]}};
}