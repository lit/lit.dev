---
title: Tools and Workflows Overview
eleventyNavigation:
  key: Overview
  parent: Tools
  order: 1
---

Lit components are written using plain JavaScript or TypeScript and run out-of-the box on modern browsers with minimal tooling, so you don't _need_ any Lit-specific compilers, tools, or workflows.

However, Lit uses very _modern_ web platform features, so it does require some tooling and polyfills to run on older browsers. Some tools also require configuration options to handle modern JavaScript. And, while Lit is "just JavaScript" there are some tools that make working with web components  much nicer.

The tools and workflows docs cover the different phases of development:

* [Requirements](/docs/tools/requirements/): Common requirements for tools and browsers to work with Lit out of the box, as well as compiler options and polyfills required for legacy browsers.
* [Development](/docs/tools/development/): Setting up your local development environment, including dev server, linting, formatting, syntax highlighting and type-checking.
* [Testing](/docs/tools/testing/): Recommendations for testing Lit projects in modern and legacy browsers.
* [Publishing](/docs/tools/publishing/): Guidelines for publishing your component packages to npm.
* [Building for production](/docs/tools/production/): Building applications for production, including bundling, optimizations, and differential serving for modern and legacy browsers.
* [Starter Kits](/docs/tools/starter-kits): Instructions on using our Lit component starter kits for JavaScript and TypeScript.
* [Adding Lit](/docs/tools/adding-lit): Installing and adding Lit to an existing project.
