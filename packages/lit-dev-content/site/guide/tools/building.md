---
title: Building
eleventyNavigation:
  key: Building
  parent: Tools
  order: 4
---

When building an app that includes Lit components, you can use common JavaScript build tools like [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/) to prepare your source code and dependencies for serving in a production environment.

The sections below describe the general requirements for configuring one of these tools to build and optimize an application that includes Lit components.

We recommend Rollup because it's designed to work with the standard ES module format. To jump directly to a sample build configuration for building an app with Rollup, see [Building with Rollup](#building-with-rollup).

Note that this page focuses primarily in building an application that uses Lit components _for production_.  For recommendations on build steps to perform on source code prior to _publishing_ a reusable Lit component to npm, see [Publishing](../publishing/).

## Build requirements {#build-requirements}

Lit is packaged as a set of ES modules, written in modern JavaScript (ES 2020) and levaraging the native Web Components APIs in the browser. These are supported natively in all modern browsers like Chrome, Safari, Firefox, and Edge.

When building an app using Lit, your build system will need to handle the following, depending on the browsers that your app targets:

*   **Modern browsers:** Resolving bare (or Node-style) module identifiers.
*   **Legacy browsers:** Transpiling JS syntax and modules and loading polyfills.

These steps are covered in detail in the sections that follow.

In addition to these minimim requirements, see [optimizations](#optimizations) for optional optimizations you should consider including in your build tooling.

### Building for modern browsers {#bare-module-specifiers}

The only transformation required to use Lit on modern browsers is to convert bare module specifiers to browser-compatible URLs.

Lit uses bare module specifiers to import modules between its sub-packages, like this:

```js
import {html} from 'lit-html';
```

Modern browsers currently only support loading modules from URLs or relative paths, not bare names that refer to an npm package, so the build system needs to handle them: either by transforming the specifier to one that works for ES modules in the browser, or by producing a different type of module as output.

Webpack automatically handles bare module specifiers; for Rollup, you'll need a plugin ([@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)).

**Why bare module specifiers?** Bare module specifiers let you import modules without knowing exactly where the package manager has installed them. A standards proposal called [Import maps](https://github.com/WICG/import-maps) is [starting to ship](https://chromestatus.com/feature/5315286962012160), which will let let browsers support bare module specifiers. In the meantime, bare import specifiers can easily be transformed as a build step. There are also some polyfills and module loaders that support import maps.

### Buildig for legacy browsers {#supporting-older-browsers}

Supporting older browsers (specifically Internet Explorer 11, but also older versions of evergreen browsers), requires a number of extra steps:

*   Transpiling modern JavaScript syntax to ES5.
*   Transforming ES modules to another module system.
*   Loading polyfills.
    *   Javascript polyfills.
    *   Web Components polyfills.
    *   Lit `polyfill-support` script.

You may need other polyfills depending on the features your application uses.

#### Transpiling to ES5 {#transpiling-to-es5}

Rollup, webpack and other build tools have plugins to support transpiling modern JavaScript for older browsers. [Babel](https://babeljs.io/) is the most commonly used transpiler.

Unlike some libraries, Lit is published as a set of ES modules using modern ES2020 JavaScript. When you build your app for older browsers, you need to compile Lit as well as your own code.

If you have a build already set up, it may be configured to ignore the `node_modules` folder when transpiling. If this is the case, we recommend updating this to transpile the `lit` package and its runtime dependencies (`lit-html` and `lit-element`). For example, if you're using the [Rollup Babel plugin](https://www.npmjs.com/package/@rollup/plugin-babel), you might have a configuration like this to exclude the `node_modules` folder from transpilation:

```js
exclude: [ 'node_modules/**' ]
```

You can replace this with a rule to explicitly include folders to transpile:

```js
include: [
  'src/**',
  'node_modules/lit/**',
  'node_modules/lit-element/**',
  'node_modules/lit-html/**'
]
```

**Why no ES5 build?** The Lit package doesn't include an ES5 build because modern JavaScript is smaller and generally faster. When building an application, you can compile modern JavaScript down to create the exact build (or builds) you need based on the browsers you need to support.

If Lit included multiple builds, individual elements could end up depending on different builds of Lit—resulting in multiple versions of the library being shipped down to the browser.


#### Transforming modules {#transforming-modules}

When producing output for older browsers without modules support like IE11, there are three common output formats:

*   No modules (IIFE). Code is bundled as a single file, wrapped in an immediately-invoked function expression (IIFE).
*   AMD modules. Uses the Asynchronous Module Definition format; requires a module loader script, such as [require.js](https://requirejs.org/).
*   SystemJS modules. [SystemJS](https://www.npmjs.com/package/systemjs) is a module loader that defines its own module format. It also supports AMD, CommonJS, and standard JavaScript modules.

The IIFE format works fine if all of your code can be bundled into a single file. To use code splitting via [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) with older browsers like IE11, you'll need to produce output in either the AMD or SystemJS module format and load the appropriate module loader/polyfill.

#### Polyfills {#polyfills}

Using Lit on older browsers will require loading polyfills for standard JavaScript features like Promises and async/await, the Web Components polyfills, as well as a `polyfill-support` script provided in the Lit package for interfacing Lit with the Web Components polyfills.

These are the recommended polyfills:

* Polyfills for JavaScript features:
  * [`core-js`](https://www.npmjs.com/package/core-js) - Standard JS library
  * [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) - Support for generators & async/await
* Polyfills for dynamic `import()` (if used in application; choose depending on how modules were transformed):
  * [`systemjs`](https://www.npmjs.com/package/systemjs) - systemjs module loader
  * [`requirejs`](https://www.npmjs.com/package/requirejs) - AMD module loader
* Polyfills for Web Components:
  * [`@webcomponents/webcomponentsjs`](https://www.npmjs.com/package/@webcomponents/webcomponentsjs) - Polyfills for custom elements, shadow DOM, template, and some newer DOM APIs
  * `lit/platform-support.js` - A file that ships in the `lit` package that must be loaded when using `webcomponentsjs`

Note that the Javascript polyfills should be bundled separately from the application bundle, and loaded before the Web Components polyfills, since those polyfills rely on modern JS like `Promise`.

## Optimizations {#optimizations}

Lit projects benefit from the same optimizations as other web projects:

*   Bundling (for example, using [Rollup](https://rollupjs.org/) or [webpack](https://webpack.js.org/)).
*   Code minification/optimization ([Terser](https://www.npmjs.com/package/terser) works well for Lit, because it supports modern JavaScript).
*   Serve-time compression (such as [gzip or brotli](https://web.dev/reduce-network-payloads-using-text-compression/#data-compression)).
*   Serving modern code to modern browsers ([article](https://web.dev/serve-modern-code-to-modern-browsers/))
*   Hashing static assets including bundled JavaScript ([article](https://web.dev/love-your-cache/#fingerprinted-urls))

See the links above for further reading on applying those standard optimizations to your projects.

In addition, note that because Lit templates are defined inside JavaScript template string literals, they don't get processed by standard HTML minifiers. Adding a plugin that minifies template literals can result in a modest decrease in code size. Several packages are available to perform this optimization:

*   Rollup: [rollup-plugin-minify-html-literals](https://www.npmjs.com/package/rollup-plugin-minify-html-literals?activeTab=readme)
*   Webpack: [minify-template-literal-loader](https://www.npmjs.com/package/minify-template-literal-loader)


## Building with Rollup {#building-with-rollup}

There are many ways to set up Rollup to bundle your project. The [Modern Web](https://modern-web.dev/) project maintains an excellent Rollup plugin `@web/rollup-plugin-html` that helps tie a number of best-practices for building applications together into an easy-to-use package.

### Modern + legacy build

The annotated `rollup.config.js` file below will build  an application that includes Lit components, implementing all of the build requirements and optimizations described on this page, and will work on all browsers down to IE11. To summarize, it:

* Finds all JS and static assets starting from a set of `*.html` entry points
* Minifies JS (code and html template literals)
* Bundles JS into two separate sets of bundles
  * Modern: ES2020 with native JS modules
  * Legacy: ES5 with SystemJS modules
* Outputs all static assets (including JS bundles) with filenames hashed based on their content
* And rewrites the HTML entry points such that they:
  * Optimistically pre-fetch the modern JS bundle
  * Use feature detection to load polyfills and either the modern or legacy JS bundles
  * Load any other assets using hashed URLs
* With all output files written to a `build` folder, appropate for production
  serving

Although it is fairly long, each plugin effectively performs one aspect of the
recommendations above and is annotated to describe its function.

Required node modules:
```sh
npm i rollup
      @web/rollup-plugin-html \
      @web/rollup-plugin-polyfills-loader \
      @web/rollup-plugin-copy \
      @rollup/plugin-node-resolve \
      @rollup/plugin-babel \
      rollup-plugin-terser \
      rollup-plugin-minify-html-literals \
      rollup-plugin-summary
```

rollup.config.js:
```js
// Import rollup plugins
import html from '@web/rollup-plugin-html';
import polyfillsLoader from '@web/rollup-plugin-polyfills-loader';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

// Configure an instance of @web/rollup-plugin-html
const htmlPlugin = html({
  rootDir: './',
  flattenOutput: false,
  // Entry point for application build; can specify a glob to build multiple
  // HTML files for non-SPA app
  input: 'index.html',
});

export default {
  plugins: [
    // Finds <script> and other assets in HTML files for bundling/compilation
    // and hashing, and re-writes HTML files to load these
    htmlPlugin,
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Inject polyfills into HTML (core-js, regnerator-runtime, webcoponents,
    // lit/polyfill-support) and dynamically loads modern vs. legacy builds
    polyfillsLoader({
      modernOutput: {
        name: 'modern',
      },
      // Feature detection for loading legacy bundles
      legacyOutput: {
        name: 'legacy',
        test: "!('noModule' in HTMLScriptElement.prototype)",
        type: 'systemjs',
      },
      // List of polyfills to inject (each has individual feature detection)
      polyfills: {
        hash: true,
        coreJs: true,
        regeneratorRuntime: true,
        webcomponents: true,
        // Custom configuration for loading Lit's polyfill-support module,
        // required for interfacing with the webcomponents polyfills
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test:
              "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
    // Print bundle summary
    summary(),
    // Optional: copy any static assets to build directory
    copy({
      patterns: ['data/**/*', 'images/**/*'],
    }),
  ],
  // Specifies two JS output configurations, modern and legacy, which the HTML plugin will
  // automatically choose between; the legacy build is transpiled to ES5
  // and SystemJS modules
  output: [
    {
      // Modern JS bundles (no JS transpilation, JS module output)
      format: 'esm',
      chunkFileNames: '[name]-[hash].js',
      entryFileNames: '[name]-[hash].js',
      dir: 'build',
      plugins: [htmlPlugin.api.addOutput('modern')],
    },
    {
      // Legacy JS bundles (ES5 transpilation and SystemJS module output)
      format: 'esm',
      chunkFileNames: 'legacy-[name]-[hash].js',
      entryFileNames: 'legacy-[name]-[hash].js',
      dir: 'build',
      plugins: [
        htmlPlugin.api.addOutput('legacy'),
        // Uses babel to compile JS to ES5 and modules to SystemJS
        getBabelOutputPlugin({
          compact: true,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: '11',
                },
                modules: 'systemjs',
              },
            ],
          ],
        }),
      ],
    },
  ],
  preserveEntrySignatures: 'strict',
};
```
Running the rollup build:
```sh
rollup -c
```

### Modern-only build

The following much simpler configuration is suitable for serving only to modern browsers.

```js
// Import rollup plugins
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
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
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Print bundle summary
    summary(),
    // Optional: copy any static assets to build directory
    copy({
      patterns: ['data/**/*', 'images/**/*'],
    }),
  ],
  output: {
    dir: 'build',
  },
  preserveEntrySignatures: 'strict',
};
```

## Building with standalone lit-html

If you're using lit-html as a standalone templating library, you can follow almost all of the guidance for building with Lit. The only difference is that lit-html doesn't require the full Web Components polyfills. You'll only need the template polyfill.

### Using the template polyfill

To run lit-html on Internet Explorer 11, which doesn't support the `<template>` element, you'll need a polyfill. You can use the template polyfill included with the Web Components polyfills.

Install the template polyfill:

```bash
npm i @webcomponents/template
```

Use the template polyfill:

```html
<script src="./node_modules/@webcomponents/template/template.js"></script>
```

Note: when transpiling for IE11, the Babel polyfills need to be bundled separately from the application code, and loaded *before* the template polyfill.
