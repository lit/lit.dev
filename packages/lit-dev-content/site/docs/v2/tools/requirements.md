---
title: Requirements
eleventyNavigation:
  key: Requirements
  parent: Tools
  order: 2
versionLinks:
  v1: tools/build/#build-requirements
  v3: tools/requirements/
---

The most important things to know about Lit in order to work with various browsers and tools are that:

 * Lit is published as ES2019.
 * Lit uses "bare module specifiers" to import modules.
 * Lit uses modern web APIs such as `<template>`, custom elements, shadow DOM, and `ParentNode`.

These features are supported by the latest versions of major browsers (including Chrome, Edge, Safari, and Firefox) and most popular tools (such as Rollup, Webpack, Babel, and Terser)—with the exception of bare module specifier support in browsers.

When developing an app using Lit, either your target browsers need to support those features natively, or your tools will need to handle them. While there are a large number of browsers with various support for modern web features, for simplicity we recommend grouping browsers into one of two categories:

*   **Modern browsers** support ES2019 and web components. Tools must resolve bare module specifiers.
*   **Legacy browsers** support ES5 and don't support web components or newer DOM APIs. Tools must compile JavaScript and load polyfills.

This page gives a general overview for how to meet these requirements in your development and productions environments.

See [Development](/docs/v2/tools/development/), [Testing](/docs/v2/tools/testing/), and [Building for Production](/docs/v2/tools/production/) for recommendations on tools and configurations that meet these requirements.

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

All modern browsers update automatically and users are highly likely to have a recent version. The following table lists the minimum version of each major browser that natively supports ES2019 and web components, the key features on which Lit relies.

| Browser	| Supports ES2019 & web components |
|:--------|:--------------------------------:|
| Chrome  |	>=73                             |
| Safari  |	>=12.1                           |
|	Firefox |	>=63                             |
|	Edge    |	>=79                             |

## Requirements for legacy browsers {#building-for-legacy-browsers}

Supporting older browsers (specifically Internet Explorer 11, but also older versions of evergreen browsers), requires a number of extra steps:

*   Compiling modern JavaScript syntax to ES5.
*   Transforming ES modules to another module system.
*   Loading polyfills.

### Legacy browser breakdown

The following table lists supported browser versions that require compiling Javascript and loading polyfills:

| Browser           | Compile JS | Compile JS & load polyfills |
|:------------------|:------------:|:-----------------------------:|
| Chrome            | 67-79        | <67                           |
| Safari            | 10-12        | <10                           |
| Firefox           | 63-71        | <63                           |
| Edge              | 79           |                               |
| Edge "classic"    |              | <=18                         |
| Internet Explorer |              | 11                            |

### Compiling to ES5 {#compiling-to-es5}

Rollup, webpack and other build tools have plugins to support compiling modern JavaScript for older browsers. [Babel](https://babeljs.io/) is the most commonly used compiler.

Unlike some libraries, Lit is published as a set of ES modules using modern ES2019 JavaScript. When you build your app for older browsers, you need to compile Lit as well as your own code.

If you have a build already set up, it may be configured to ignore the `node_modules` folder when compiling. If this is the case, we recommend updating this to compile the `lit` package and its runtime dependencies (`lit-html` and `lit-element`). For example, if you're using the [Rollup Babel plugin](https://www.npmjs.com/package/@rollup/plugin-babel), you might have a configuration like this to exclude the `node_modules` folder from compilation:

```js
exclude: [ 'node_modules/**' ]
```

You can replace this with a rule to explicitly include folders to compile:

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


### Transforming modules {#transforming-modules}

When producing output for older browsers without modules support like IE11, there are three common output formats:

*   No modules (IIFE). Code is bundled as a single file, wrapped in an immediately-invoked function expression (IIFE).
*   AMD modules. Uses the Asynchronous Module Definition format; requires a module loader script, such as [require.js](https://requirejs.org/).
*   SystemJS modules. [SystemJS](https://www.npmjs.com/package/systemjs) is a module loader that defines its own module format. It also supports AMD, CommonJS, and standard JavaScript modules.

The IIFE format works fine if all of your code can be bundled into a single file. To use code splitting via [dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) with older browsers like IE11, you'll need to produce output in either the AMD or SystemJS module format and load the appropriate module loader/polyfill.

## Polyfills {#polyfills}

Using Lit on older browsers will require loading polyfills for standard JavaScript features like Promises and async/await, the web components polyfills, as well as a `polyfill-support` script provided in the Lit package for interfacing Lit with the Web Components polyfills.

These are the recommended polyfills:

* Polyfills for JavaScript features:
  * [`core-js`](https://www.npmjs.com/package/core-js) - Standard JS library
  * [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) - Support for generators & async/await
* Polyfills for dynamic `import()` (if used in application; choose depending on how modules were transformed):
  * [`systemjs`](https://www.npmjs.com/package/systemjs) - systemjs module loader
  * [`requirejs`](https://www.npmjs.com/package/requirejs) - AMD module loader
* Polyfills for Web Components:
  * [`@webcomponents/webcomponentsjs`](https://www.npmjs.com/package/@webcomponents/webcomponentsjs) - Polyfills for custom elements, shadow DOM, template, and some newer DOM APIs
  * `lit/polyfill-support.js` - A file that ships in the `lit` package that must be loaded when using `webcomponentsjs`

Note that you may need other polyfills depending on the features your application uses.

### Loading polyfills

The Javascript polyfills should be bundled separately from the application bundle, and loaded before the web components polyfills, since those polyfills rely on modern JS like `Promise`. Putting it all together, the page should load code as follows:

```html
<script src="path/to/js/polyfills/you/need.js"></script>
<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Load application code here -->
```

### Web components polyfills

For detailed information about loading and configuring the web components polyfills, see the [webcomponentsjs documentation](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs). The following is a summary of some of the key points.

#### Loading options

There are two main ways to load the web components polyfills:

- `webcomponents-bundle.js` includes all of the polyfills necessary to run on any of the supported browsers. Because all browsers receive all polyfills, this results in extra bytes being sent to browsers that support one or more feature.
- `webcomponents-loader.js` performs client-side feature-detection and loads just the required polyfills. This requires an extra round-trip to the server, but saves bandwidth for browsers that support one or more features.

#### Loading the ES5 adapter

It's best to serve a modern build to modern browsers to avoid sending the extra code needed for older browsers. However, it can be convenient to serve just a single set of files. If you do this, there is one extra required step. In order for ES5 compiled code to work with native web components and specifically custom elements, a small adapter is needed. For a detailed explanation, see the [webcomponentsjs documentation](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#custom-elements-es5-adapterjs).

Load the `custom-elements-es5-adapter.js` after any Babel polyfills and before web components, like this:

```html
<script src="path/to/js/polyfills/you/need.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Load application code here -->
```

#### Setting web components polyfill options

By default, the individual polyfill for a given feature is disabled on browsers that natively support that feature.
For testing purposes, you can force the polyfills on for browsers that have native support.

While the web components polyfills strive to match the spec, there are some infidelities particularly around styling (see [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations)). We recommend ensuring you test with polyfills both on and off, either on the browsers that need them, or by forcing them on. You can force the polyfills on by adding a JavaScript snippet before you import the polyfills:

```html
<script>
  // Force all polyfills on
  if (window.customElements) window.customElements.forcePolyfill = true;
  ShadyDOM = { force: true };
  ShadyCSS = { shimcssproperties: true};
</script>
<script src="./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
```

Or, you if you use the `webcomponents-bundle.js` file, you can force the polyfills on by adding query parameters to the app's URL:

`https://www.example.com/my-application/view1?wc-ce&wc-shadydom&wc-shimcssproperties`

The following table lists the JavaScript snippets and query parameters for each polyfill.

| Polyfill    | Javascript                          | Query parameter          |
|:------------|:------------------------------------|:-------------------------|
| Custom Elements | `if (window.customElements) window.customElements.forcePolyfill = true;` | `wc-ce` |
| Shadow DOM | `ShadyDOM = { force: true };` | `wc-shadydom`              |
| CSS custom properties | `ShadyCSS = { shimcssproperties: true};` | `wc-shimcssproperties` |
