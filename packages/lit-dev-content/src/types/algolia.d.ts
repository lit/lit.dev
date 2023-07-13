/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Algolia hasn't seem to ahve set up their esm build with TS correctly, so this
// reexports the `lite` (reaadonly) package types to the correct import
// location.
declare module 'algoliasearch/dist/algoliasearch-lite.esm.browser.js' {
  import algoliasearch from 'algoliasearch/lite';
  export * from 'algoliasearch/lite';
  export default algoliasearch;
}
