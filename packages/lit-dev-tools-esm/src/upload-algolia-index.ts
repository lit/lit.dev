/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import algolia from 'algoliasearch';
import fs from 'fs';
import {publicVars} from './configs.js';

const searchIndexRaw = fs.readFileSync(
  '../lit-dev-content/_site/searchIndex.json',
  'utf8'
);
const searchIndex = JSON.parse(searchIndexRaw);
const ALGOLIA_WRITE_KEY = process.env.ALGOLIA_WRITE_KEY;

if (!ALGOLIA_WRITE_KEY) {
  throw new Error('ALGOLIA_WRITE_KEY environment variable is not set');
}

const client = algolia(publicVars.algolia.appId, ALGOLIA_WRITE_KEY);
const index = client.initIndex(publicVars.algolia.index);
await Promise.all([
  index.setSettings({
    // https://www.algolia.com/doc/api-reference/api-parameters/attributeForDistinct/
    attributeForDistinct: 'parentID',
    // Facets are used for grouping. We don't use them, but we might eventually.
    attributesForFaceting: ['title', 'docType.tag'],
  }),
  index.replaceAllObjects(searchIndex),
]);
