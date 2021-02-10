/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
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
    input: 'lib/docs.js',
    output: {
      file: 'site/_includes/js/docs.js',
      format: 'esm',
    },
    plugins: [resolve(), terser(terserOptions), summary()],
  },
  {
    input: 'lib/home.js',
    output: {
      file: 'site/_includes/js/home.js',
      format: 'esm',
    },
    plugins: [resolve(), terser(terserOptions), summary()],
  },
  {
    input: 'lib/playground.js',
    output: {
      file: 'site/_includes/js/playground.js',
      format: 'esm',
    },
    plugins: [resolve(), terser(terserOptions), summary()],
  },
  {
    input: ['lib/site.js', 'lib/playground-elements.js'],
    output: {
      dir: '_site/js/',
      format: 'esm',
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
    onwarn(warning) {
      if (warning.code !== 'CIRCULAR_DEPENDENCY') {
        console.error(`(!) ${warning.message}`);
      }
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
