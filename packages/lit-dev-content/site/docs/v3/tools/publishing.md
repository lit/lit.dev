---
title: Publishing
eleventyNavigation:
  key: Publishing
  parent: Tools
  order: 5
versionLinks:
  v1: tools/publish/
  v2: tools/publishing/
---

This page provides guidelines for publishing a Lit component to [npm](https://www.npmjs.com/), the package manager used by the vast majority of JavaScript libraries and developers. See [Starter Kits](/docs/v3/tools/starter-kits/) for reusable component templates set up for publishing to npm.

## Publishing to npm

To publish your component to npm, [see the instructions on contributing npm packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

Your package.json configuration should have the `type`, `main`, and `module` fields:

**package.json**

```json
{
  "type": "module",
  "main": "my-element.js",
  "module": "my-element.js"
}
```

You should also create a README describing how to consume your component.

## Publishing modern JavaScript

We recommend publishing JavaScript modules in standard [ES2021](https://compat-table.github.io/compat-table/es2016plus/) syntax, as this is supported on all evergreen browsers and results in the fastest and smallest JavaScript. Users of your package can always use a compiler to support older browsers, but they can't transform legacy JavaScript to modern syntax if you pre-compile your code before publishing.

However, it is important that if you are using newly proposed or non-standard JavaScript features such as TypeScript, decorators, and class fields, you _should_ compile those features to standard ES2021 supported natively in browsers before publishing to npm.

### Compiling with TypeScript

The following JSON sample is a partial `tsconfig.json` that uses recommended options for targeting ES2021, enables compilation of decorators, and outputs `.d.ts` types for users:

**tsconfig.json**

```json
"compilerOptions": {
  "target": "es2021",
  "module": "es2015",
  "moduleResolution": "node",
  "lib": ["es2021", "dom"],
  "declaration": true,
  "declarationMap": true,
  "experimentalDecorators": true,
  "useDefineForClassFields": false
}
```

Note, setting `useDefineForClassFields` to `false` should only be required when the `target` is set to `es2022` or greater including `esnext`, but it's recommended to explicitly ensure this setting is `false`.

When compiling from TypeScript, you should include declaration files
(generated based on `declaration: true` above) for your component's types in the
`types` field of `package.json`, and ensure the `.d.ts` and `.d.ts.map` files
are published as well:

**package.json**
```json
{
  ...
  "types": "my-element.d.ts"
}
```

See the [tsconfig.json documentation](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for more information.

### Compiling with Babel

To compile a Lit component that uses proposed JavaScript features not yet included in ES2021, use Babel.

Install Babel and the Babel plugins you need. For example:

```sh
npm install --save-dev @babel/core
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-decorators
```

Configure Babel. For example:

**babel.config.js**

```js
const assumptions = {
  "setPublicClassFields": true
};

const plugins = [
  ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true } ],
  ["@babel/plugin-proposal-class-properties"],

];

module.exports = { assumptions, plugins };
```

You can run Babel via a bundler plugin such as [@rollup/plugin-babel](https://www.npmjs.com/package/@rollup/plugin-babel), or from the command line. See the [Babel documentation](https://babeljs.io/docs/en/) for more information.

## Publishing best practices

The following are other good practices to follow when publishing reusable Web Components.

### Don't import polyfills into modules

Polyfills are an application concern, so the application should depend directly
on them, not individual packages. The exact polyfills needed often depends on
the browsers the application needs to support, and that choice is best left to
the application developer using your component. Your component's documentation **should** clearly identify any APIs it uses that may require polyfills. 

Packages may need to depend on polyfills for tests and demos, so if
they're needed, they should only go in `devDependencies`.

### Don't bundle, minify, or optimize modules

Bundling and other optimizations are application concerns. Bundling a reusable component before publishing to npm can also introduce multiple versions of Lit (and other packages) into a user's application since npm can't deduplicate the packages. This causes bloat and may cause bugs.

Optimizing modules before publication may also prevent application-level optimizations.

Bundling and other optimizations can be valuable when serving a module from a CDN, but since users may need to use multiple packages that depend on Lit, serving from a CDN can result in users loading more code than necessary. For these reasons we recommend performance-sensitive applications always build from npm where packages can be deduplicated, rather than loading bundled packages off of a CDN.

If you want to support usage from a CDN, we recommend making a clear separation between the CDN modules and the modules intended for production use. For example, placing them in a separate folder, or only adding them as part of a GitHub release and not adding them to the published npm module. 

### Include file extensions in import specifiers

Node module resolution doesn't require file extensions because it does a search
of the file system looking for one of several file extensions if one isn't
given. When you import `some-package/foo`, Node will import
`some-package/foo.js` if it exists. Likewise, build tools that resolve package
specifiers to URLs can also do this file system search at build time.

However, the [import maps](https://github.com/WICG/import-maps) specification
that is [starting to ship](https://chromestatus.com/feature/5315286962012160) in
browsers will allow the browser to load modules with bare package specifiers
from source _untransformed_, by providing a mapping of import specifiers to URLs
in an import map manifest (that will likely be tool generated based on your e.g.
npm installation).

Import maps will allow mapping imports to URLs, but they only have two type of
mappings: exact and prefix. That means it is easy to alias _all_ modules under a
given package by mapping the package name to a single URL prefix. However, if
you write imports without file extensions, it means that _each file_ in your
package would need an entry in the import map.
This
could greatly bloat the import map.

Thus, to prepare your source now to be optimally compatible with import maps, we
recommend authoring with file extensions on imports.

### Publish TypeScript typings

To make your element easy to use from TypeScript, we recommend that you:

*   Add an `HTMLElementTagNameMap` entry for all elements authored
in TypeScript.

    ```ts
    @customElement('my-element')
    export class MyElement extends LitElement { /* ... */ }

    declare global {
      interface HTMLElementTagNameMap {
        "my-element": MyElement;
      }
    }
    ```
*   Publish your `.d.ts` typings in your npm package.


 For more information about `HTMLElementTagNameMap`, see [Providing good TypeScript typings](/docs/v3/components/defining/#typescript-typings).

### Self-define elements

The module that declares the web component class should always include a call to
`customElements.define()` (or the `@customElement` decorator) to define the element.

Currently, web components are always defined in a global registry. Each custom element definition needs to use a unique tag name **and** a unique JavaScript class. Attempting to register the same tag name twice, or the same class twice will fail with an error. Simply exporting a class and expecting the user to call `define()` is brittle. If two different components both depend on a shared third component, and both try to define it, one will fail. This isn't a problem if an element is always defined in the same module where its class is declared.

One downside of this approach is that if two different elements use the same tag name, they can't both be imported to the same project.

Work is progressing on adding [Scoped Custom Element
Registries](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md)
to the platform. Scoped registries allow a custom element's tag name to be chosen by the
user of the component for a given shadow root scope. Once browsers start
shipping this feature, it will become practical to publish two modules for each component: one that exports the custom element class with no side effects, and one that registers it globally with a tag name.

Until then, we recommend continuing to register elements in the global registry.

### Export element classes

In order to support subclassing, export your element class from the module that
defines it. This allows subclassing for extension purposes, as well as for
registering in [Scoped Custom Element
Registries](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md)
in the future.

## For more reading

For a more general guide for creating high-quality reusable web components, see
the [Gold Standard Checklist for Web
Components](https://github.com/webcomponents/gold-standard/wiki).
