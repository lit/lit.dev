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
      dir: '_site/js/',
      format: 'esm',
      // Preserve directory structure for entrypoints.
      entryFileNames: ({facadeModuleId}) =>
        facadeModuleId.replace(`${__dirname}/lib/`, ''),
      // Override the default chunk name of "[name]-[hash].js" because:
      //
      // 1. By default, the hash is included in the filename, which would
      //    require us to pipe the hash to the Eleventy HTML template somehow,
      //    because we preload this chunk. This will obviously break if we ever
      //    have >1 chunk, so we'll probably eventually need to do this piping
      //    (chunkFileNames can also be a function, so we could pick static
      //    names that way too).
      //
      // 2. The default name is picked from one of the included modules. In our
      //    case, it picks "mwc-icon-button", which isn't great because this
      //    more importantly contains lit, mwc-base, etc.
      chunkFileNames: 'common.js',
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
