const {generateManifest} = require('../../samples/js/tutorials/utils.cjs.js');
const {getManifest} = require('../../samples/js/tutorials/intro-to-lit/11ty-data.cjs.js');

// This file is replaced in a subsequent PR. It's only here to keep the build
// functioning for the current PR
module.exports = async () => {
  await generateManifest(await getManifest(), 'intro-to-lit');
  return {};
}