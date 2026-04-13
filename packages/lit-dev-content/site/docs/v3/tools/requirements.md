---
title: Requirements
eleventyNavigation:
  key: Requirements
  parent: Tools
  order: 2
versionLinks:
  v1: tools/build/#build-requirements
  v2: tools/requirements/
---

The most important things to know about Lit in order to work with various browsers and tools are that:

 * Lit is published as ES2021.
 * Lit uses "bare module specifiers" to import modules.
 * Lit uses modern web APIs such as `<template>`, custom elements, shadow DOM, and `ParentNode`.

These features are supported by the latest versions of major browsers (including Chrome, Edge, Safari, and Firefox) and most popular tools (such as Rollup, Webpack, Babel, and Terser)—with the exception of bare module specifier support in browsers.

When developing an app using Lit, either your target browsers need to support those features natively, or your tools will need to handle them. While there are a large number of browsers with various support for modern web features, for simplicity we recommend grouping browsers into one of two categories:

*   **Modern browsers** support ES2021 and web components. Tools must resolve bare module specifiers.
*   **Legacy browsers** support ES5 and don't support web components or newer DOM APIs. Tools must compile JavaScript and load polyfills.

This page gives a general overview for how to meet these requirements in your development and productions environments.

See [Development](/docs/v3/tools/development/), [Testing](/docs/v3/tools/testing/), and [Building for Production](/docs/v3/tools/production/) for recommendations on tools and configurations that meet these requirements.

## Requirements for modern browsers {#building-for-modern-browsers}

The only transformation required to use Lit on modern browsers is to convert bare module specifiers to browser-compatible URLs.

Lit uses bare module specifiers to import modules between its sub-packages, like this:

```js
import {html} from 'lit-html';
```

Modern browsers currently only support loading modules from URLs or relative paths, not bare names that refer to an npm package, so the build system needs to handle them. This should be done either by transforming the specifier to one that works for ES modules in the browser, or by producing a different type of module as output.

Webpack automatically handles bare module specifiers; for Rollup, you'll need a plugin ([@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)).

**Why bare module specifiers?** Bare module specifiers let you import modules without knowing exactly where the package manager has installed them. A standards proposal called [Import maps](https://github.com/WICG/import-maps) is [starting to ship](https://chromestatus.com/feature/5315286962012160), which will let browsers support bare module specifiers. In the meantime, bare import specifiers can easily be transformed as a build step. There are also some polyfills and module loaders that support import maps.

### Modern browser breakdown

All modern browsers update automatically and users are highly likely to have a recent version. Lit and related libraries are tested on the current versions of Chromium, Safari, and Firefox as well as two major versions prior for Chromium and Safari, and the Extended Support Release (ESR) for Firefox. Older versions may still work but will be at best efforts without guarantee.

## Note on legacy browsers {#note-on-legacy-browsers}

Lit 3 is not tested on legacy browsers, specifically Internet Explorer 11 and Classic Edge are not supported due to non-standard DOM behavior. If you must support legacy browsers, consider using Lit 2 with additional compilation and/or polyfills as described in [Building for legacy browsers](/docs/v2/tools/requirements#building-for-legacy-browsers).

