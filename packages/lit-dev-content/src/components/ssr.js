/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// list of components that should be rendered on server side
const componentsToSSR = [
  'lib/components/litdev-tutorial-card.js',
  'lib/components/litdev-search.js',
];

module.exports = {
  componentsToSSR,
};
