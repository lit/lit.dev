/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve';
import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';

const terserOptions = {
  warnings: true,
  ecma: 2020,
  compress: {
    unsafe: true,
    passes: 2,
  },
  output: {
    // "some" preserves @license and @preserve comments
    comments: 'some',
    inline_script: false,
  },
  mangle: {
    properties: false,
  },
};

export default [
  {
    input: [
      'lib/components/copy-button.js',
      'lib/components/litdev-example.js',
      'lib/components/litdev-tutorial.js',
      'lib/components/playground-elements.js',
      'lib/components/resize-bar.js',
      'lib/global/mobile-nav.js',
      'lib/global/mods.js',
      'lib/pages/docs.js',
      'lib/pages/home.js',
      'lib/pages/playground.js',
    ],
    output: {
      dir: 'rollupout',
      format: 'esm',
      // Preserve directory structure for entrypoints.
      entryFileNames: ({facadeModuleId}) =>
        facadeModuleId.replace(`${__dirname}/lib/`, ''),
      // Make sure we have a clean lit chunk. People will be looking for this :)
      manualChunks: {
        lit: ['lit-html', 'lit-element'],
      },
      // Override the default chunk name of "[name]-[hash].js"
      chunkFileNames: (info) => {
        for (const module of Object.keys(info.modules)) {
          // Most common MWC stuff goes into one chunk, but Rollup usually picks
          // "mwc-icon-button.js" using its default name picking heuristic.
          // Assume that the chunk with "base-element" in it is the majority of
          // MWC common stuff, and give it a better name.

          // TODO(aomarks) Why is Rollup creating an "observer.js" with just MWC
          // observer code in it? It could just be included in the base one...?
          if (module.includes('/@material/mwc-base/base-element.js')) {
            return 'mwc-common.js';
          }
          // Drop the es6 suffix from tslib.
          if (module.includes('/tslib/tslib.es6.js')) {
            return 'tslib.js';
          }
        }
        // Otherwise just use the input name, but skip the usual "-[hash]"
        // suffix. We pre-load certain common chunks so we want to know its
        // exact name (e.g. "lit.js"), and we don't have cache headers that
        // would take advantage of hashed names anyway.
        return '[name].js';
      },
    },
    plugins: [
      resolve({
        dedupe: () => true,
      }),
      terser(terserOptions),
      summary(),
    ],
  },
];
