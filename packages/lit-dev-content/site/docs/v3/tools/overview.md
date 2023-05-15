---
title: Tools and workflows overview
eleventyNavigation:
  key: Overview
  parent: Tools
  order: 1
versionLinks:
  v1: lit-html/tools/
  v2: tools/overview/
---

Lit components are written using plain JavaScript or TypeScript and run out-of-the box on modern browsers with minimal tooling, so you don't _need_ any Lit-specific compilers, tools, or workflows.

However, Lit uses very _modern_ web platform features, so it does require some tooling and polyfills to run on older browsers. Some tools also require configuration options to handle modern JavaScript. And, while Lit is "just JavaScript" there are some tools that make working with web components  much nicer.

The tools and workflows docs cover the different phases of development:

* [Requirements](/docs/v3/tools/requirements/): Common requirements for tools and browsers to work with Lit out of the box, as well as compiler options and polyfills required for legacy browsers.
* [Development](/docs/v3/tools/development/): Setting up your local development environment, including dev server, linting, formatting, syntax highlighting and type-checking.
* [Testing](/docs/v3/tools/testing/): Recommendations for testing Lit projects in modern and legacy browsers.
* [Publishing](/docs/v3/tools/publishing/): Guidelines for publishing your component packages to npm.
* [Building for production](/docs/v3/tools/production/): Building applications for production, including bundling, optimizations, and differential serving for modern and legacy browsers.
* [Starter Kits](/docs/v3/tools/starter-kits): Instructions on using our Lit component starter kits for JavaScript and TypeScript.
* [Adding Lit](/docs/v3/tools/adding-lit): Installing and adding Lit to an existing project.
