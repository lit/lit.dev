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
    // TODO(aomarks) Find out why we can't do property renaming. Something in
    // MWC?
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
      manualChunks: (id) => {
        // Create some more logical shared chunks. In particular, people will
        // probably be looking for lit.js in devtools!
        const relative = id.replace(`${__dirname}/node_modules/`, '');
        if (
          relative.startsWith('lit-html/') ||
          relative.startsWith('lit-element/')
        ) {
          return 'lit';
        }
        if (
          relative.startsWith('@material/mwc-base/') ||
          relative.startsWith('@material/base/')
        ) {
          return 'mwc-base';
        }
        if (relative.startsWith('tslib/')) {
          return 'tslib';
        }
      },
      // Skip the usual "-[hash]" suffix. We pre-load certain common chunks so
      // we want to know its exact name (e.g. "lit.js"), and we don't have cache
      // headers that would take advantage of hashed names anyway.
      chunkFileNames: '[name].js',
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
