---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Tools
  order: 1
---

The Lit packages use very plain, standard JavaScript. They don't require any specific compiler, tools, or bespoke workflow. Lit is designed to run out-of-the box on modern browsers with little-to-no tools at all.

However, Lit uses very _modern_ web platform features, so it does require some tooling and polyfills to run on older browsers. Some tools also require configuration options to handle Lit's modern JavaScript. And, while Lit is "just JavaScript", there are some projects that make working with HTML in tagged template literals nicer.

## JavaScript Version

Lit is written in TypeScript and compiled to and published as standard JavaScript ES2020, which is supported by the last two versions of Chrome, Edge, Safari, and Firefox. ES2020 must be compiled for older browsers. See [Requirements for legacy browsers](/guide/tools/requirements/#building-for-legacy-browsers) for more information.

### Bare Module Specifiers
Lit packages use so-called "bare module specifiers" to reference each other:

```ts
import {render, html} from 'lit-html';
```

Browsers only support bare module specifiers with the brand new _import map_ standard, which is currently only implemented in Chrome. To work on other browsers, bare import specifiers have to be _resolved_ to URLs and transformed before being loaded.

### TypeScript Type Definitions

We publish type definitions generated from TypeScript 4.2 and downlevel them for TypeScript 3.4. See [Using TypeScript](/guide/tools/development/#typescript) for more information.

## Required Browser APIs

### Web Components APIs

Lit requires the web components APIs, such as custom elements, and shadow DOM. These are supported in all current major browsers and on older browsers via the web components polyfills. See [Polyfills](/guide/tools/requirements/#polyfills) for more information.

### Other DOM APIs

Lit uses other recent DOM APIs that are well supported in current browsers, and have polyfills for older browsers like IE11. These are included in the webcomponents polyfills, among others.  See [Polyfills](/guide/tools/requirements/#polyfills) for more information.

## Development and Production Builds

All the Lit packages are published with development and production builds, using Node's support for export conditions. The default build is the production build, so that projects don't accidentally deploy the larger development build.

Tools like Rollup, Webpack, and @web/dev-server can choose what build to select from packages by specifying export conditions. This is done differently for each tool.

## Development with Lit templates

Lit templates are standard JavaScript, but developers can benefit from additional syntax highlighting, linting, and type-checking with various editor and compiler plugins.
