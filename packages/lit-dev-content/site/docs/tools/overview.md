---
title: Tools and Workflows Overview
eleventyNavigation:
  key: Overview
  parent: Tools
  order: 1
---

Lit components are written using plain JavaScript or TypeScript and run out-of-the box on modern browsers with little-to-no tools, so you don't _need_ any Lit-specific compilers, tools, or workflows.

However, Lit uses very _modern_ web platform features, so it does require some tooling and polyfills to run on older browsers. Some tools also require configuration options to handle Lit's modern JavaScript. And, while Lit is "just JavaScript" there are some tools that make working with web components  much nicer.

The tools and workflows docs cover the different phases of development:

* [Requirements](/docs/tools/requirements/): What compiler options and polyfills are required for running on legacy browsers.
* [Development](/docs/tools/development/): How to set up a local dev server, linting, formatting, syntax highlighting and type-checking.
* [Testing](/docs/tools/testing/): Reccomendations for testing tools.
* [Publishing](/docs/tools/publishing/): How to publish component packages to npm.
* [Building for production](/docs/tools/production/): Building applications for production, including bundling, optimizations, and serving legacy browsers.
