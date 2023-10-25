/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import resolve from '@rollup/plugin-node-resolve';
import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';

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
      // lit-hydrate-support MUST be loaded first to make sure lit hydration
      // helpers are bundled before LitElement attempts to use hydration support
      'lib/global/lit-hydrate-support.js',
      'lib/components/copy-button.js',
      'lib/components/litdev-banner.js',
      'lib/components/litdev-drawer.js',
      'lib/components/litdev-example.js',
      'lib/components/ts-js.js',
      'lib/components/litdev-switchable-sample.js',
      'lib/components/litdev-tutorial.js',
      'lib/components/playground-elements.js',
      'lib/components/resize-bar.js',
      'lib/components/litdev-playground-page.js',
      'lib/github/github-signin-receiver-page.js',
      'lib/global/hydrate-common-components.js',
      'lib/pages/docs.js',
      'lib/pages/home.js',
      'lib/pages/learn.js',
      'lib/pages/home-components.js',
      'lib/pages/playground-inline.js',
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
        //
        // The id is the full resolved path to the module in node_modules/
        // (which could be in this package, or in the root package). Remove the
        // node_modules/ path prefix to get a relative path which is just the
        // bare package name and module.
        const relative = id.replace(/^.*\/node_modules\//, '');
        if (
          relative.startsWith('lit/') ||
          relative.startsWith('lit-html/') ||
          relative.startsWith('lit-element/') ||
          relative.startsWith('@lit/reactive-element/') ||
          relative.startsWith('@lit-labs/ssr-client/')
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
      resolve(),
      minifyHTML(),
      terser(terserOptions),
      summary({
        // Already minified.
        showMinifiedSize: false,
      }),
    ],
    preserveEntrySignatures: false,
  },

  // A separate bundle is made for the server so that we do not modify the
  // client module graph just to SSR a component.
  {
    input: ['lib/components/ssr.js'],
    output: {
      dir: 'rollupout/server',
      format: 'esm',
    },
    plugins: [
      resolve({exportConditions: ['node']}),
      minifyHTML(),
      terser(terserOptions),
      summary({
        // Already minified.
        showMinifiedSize: false,
      }),
    ],
  },

  // These scripts are inlined and must run before first render because they set
  // global CSS classes/attributes that would otherwise cause restyle/relayout.
  //
  // We compile them separately here because they include imports for a small
  // amount of code that we want to inline directly (again, because we want to
  // execute immediately), even though that code is technically duplicated into
  // the asynchronously-loaded module bundles above.
  {
    input: [
      'lib/global/apply-mods.js',
      'lib/global/initialize-typescript-attribute.js',
      'lib/global/mobile-drawer.js',
      'lib/global/dsd-polyfill.js',
    ],
    output: {
      dir: 'rollupout',
      format: 'esm',
      // Preserve directory structure for entrypoints.
      entryFileNames: ({facadeModuleId}) =>
        facadeModuleId.replace(`${__dirname}/lib/`, ''),
    },
    plugins: [
      resolve(),
      minifyHTML(),
      terser({
        ...terserOptions,
        output: {
          ...terserOptions.output,
          // Remove license comment for inline script.
          comments: false,
        },
      }),
      summary({
        // Already minified.
        showMinifiedSize: false,
      }),
    ],
  },
];
