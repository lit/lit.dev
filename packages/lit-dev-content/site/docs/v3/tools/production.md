---
title: Building for production
eleventyNavigation:
  key: Production
  parent: Tools
  order: 6
versionLinks:
  v1: tools/build/
  v2: tools/production/
---

This page focuses on recommendations for building an _application_ that uses Lit components for production.  For recommendations on build steps to perform on source code prior to publishing a reusable Lit _component_ to npm, see [Publishing](/docs/v3/tools/publishing/).

When building an application that includes Lit components, you can use common JavaScript build tools like [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/) to prepare your source code and dependencies for serving in a production environment.

See [Requirements](/docs/v3/tools/requirements/) for a full list of requirements for building Lit code, which apply to both development and production.

In addition to those minimum requirements, this page describes optimizations you should consider when preparing code for production, as well as a concrete Rollup configuration that implements them.

## Preparing code for production {#preparing-code-for-production}

Lit projects benefit from the same build-time optimizations as other web projects. The following optimizations are recommended when serving Lit applications in production:

*   Bundling Javascript modules to reduce network requests (for example, using [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/)).
*   Minifying Javascript code for smaller payload sizes ([Terser](https://www.npmjs.com/package/terser) works well for Lit, because it supports modern JavaScript).
*   [Serving modern code to modern browsers](https://web.dev/serve-modern-code-to-modern-browsers/) as it is generally smaller and faster, and falling back to compiled code on older browsers.
*   [Hashing static assets including bundled JavaScript](https://web.dev/love-your-cache/#fingerprinted-urls) for easier cache invalidation.
*   [Enabling serve-time compression](https://web.dev/reduce-network-payloads-using-text-compression/#data-compression) (such as gzip or brotli) for fewer bytes over the wire.

In addition, note that because Lit templates are defined inside JavaScript template string literals, they don't get processed by standard HTML minifiers. Adding a plugin that minifies the HTML in template string literals can result in a modest decrease in code size. Several packages are available to perform this optimization:

*   Rollup: [rollup-plugin-minify-html-literals](https://www.npmjs.com/package/rollup-plugin-minify-html-literals?activeTab=readme)
*   Webpack: [minify-html-literals-loader](https://www.npmjs.com/package/minify-html-literals-loader)


## Building with Rollup {#building-with-rollup}

There are many tools you can use to perform the required and optional build
steps necessary to serve Lit code, and Lit does not require any one specific
tool. However, we recommend Rollup because it's designed to work with the standard ES module
format and output optimal code that leverages native modules on the client.

There are many ways to set up Rollup to bundle your project. The [Modern
Web](https://modern-web.dev/) project maintains an excellent Rollup plugin
[`@web/rollup-plugin-html`](https://modern-web.dev/docs/building/rollup-plugin-html/)
that helps tie a number of best-practices for building applications together
into an easy-to-use package. Example configurations using this plugin are described below.

### Modern-only build

The annotated `rollup.config.js` file below will build an application that meets
the [modern browser build requirements](/docs/v3/tools/requirements/#building-for-modern-browsers) and
[production optimizations](#preparing-code-for-production) described on this page. This configuration is
suitable for serving to modern browsers that can run ES2021 JS without
polyfills.

Required node modules:
```sh
npm i --save-dev rollup \
  @web/rollup-plugin-html \
  @web/rollup-plugin-copy \
  @rollup/plugin-node-resolve \
  @rollup/plugin-terser \
  rollup-plugin-minify-html-literals \
  rollup-plugin-summary
```

`rollup.config.js:`
```js
// Import rollup plugins
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

export default {
  plugins: [
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({
      input: 'index.html',
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    // Minify JS
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
    }),
    // Print bundle summary
    summary(),
    // Optional: copy any static assets to build directory
    copy({
      patterns: ['images/**/*'],
    }),
  ],
  output: {
    dir: 'build',
  },
  preserveEntrySignatures: 'strict',
};
```

Running the rollup build:
```sh
rollup -c
```
