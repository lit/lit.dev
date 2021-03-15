---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Tools
  order: 1
---

{% todo %}

TODO: write tools overview. [#1195](https://github.com/Polymer/internal/issues/1195)

{% endtodo %}

_Introduction goes here_

## Build requirements {#build-requirements}

Lit is packaged as a set of ES modules, written in modern JavaScript (ES 2020) and levaraging the native Web Components APIs in the browser. These are supported natively in all modern browsers like Chrome, Safari, Firefox, and Edge.

When developing an app using Lit, your environment will need to handle the following, depending on the browsers that your app targets:

*   **Modern browsers:** Resolving bare (or Node-style) module identifiers.
*   **Legacy browsers:** Transpiling JS syntax and modules and loading polyfills.

These steps are covered in detail in the sections that follow.

### Building for modern browsers {#building-for-modern-browsers}

The only transformation required to use Lit on modern browsers is to convert bare module specifiers to browser-compatible URLs.

Lit uses bare module specifiers to import modules between its sub-packages, like this:

```js
import {html} from 'lit-html';
```

Modern browsers currently only support loading modules from URLs or relative paths, not bare names that refer to an npm package, so the build system needs to handle them: either by transforming the specifier to one that works for ES modules in the browser, or by producing a different type of module as output.

Webpack automatically handles bare module specifiers; for Rollup, you'll need a plugin ([@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve)).

**Why bare module specifiers?** Bare module specifiers let you import modules without knowing exactly where the package manager has installed them. A standards proposal called [Import maps](https://github.com/WICG/import-maps) is [starting to ship](https://chromestatus.com/feature/5315286962012160), which will let let browsers support bare module specifiers. In the meantime, bare import specifiers can easily be transformed as a build step. There are also some polyfills and module loaders that support import maps.

### Buildig for legacy browsers {#building-for-legacy-browsers}

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
