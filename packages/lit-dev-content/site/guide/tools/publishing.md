---
title: Publishing
eleventyNavigation:
  key: Publishing
  parent: Tools
  order: 5
---

This page provides guidelines a Lit component to [npm](https://www.npmjs.com/), the package manager used by the vast majority of Javascript libraries and developers.

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

We recommend publishing JavaScript modules in standard [ES2020](https://kangax.github.io/compat-table/es2016plus/) syntax, as this is supported on all evergreen browsers and results in the fastest and smallest JavaScript. Users of your package can always downlevel further to support older browsers, but they cannot "uplevel" legacy JavaScript to modern syntax if you pre-compile your code before publishing.

However, it is important that if you are using newly proposed or non-standard JavaScript features such as TypeScript, decorators, and class fields, you _should_ transpile those features to standard ES2020 supported natively in browsers before publishing to npm.

### Transpiling with TypeScript

The following JSON sample is a partial `tsconfig.json` that uses recommended options for targeting ES2020, enables compilation of decorators, and outputs `.d.ts` types for users:

**tsconfig.json**

```json
"compilerOptions": {
  "target": "es2020",
  "module": "es2015",
  "moduleResolution": "node",
  "lib": ["es2020", "dom"],
  "declaration": true,
  "declarationMap": true,
  "experimentalDecorators": true
}
```

When transpiling from TypeScript, you should include declaration files
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

### Transpiling with Babel

To transpile a Lit component that uses proposed JavaScript features not yet included in ES2020, use Babel.

Install Babel and the Babel plugins you need. For example:

```sh
npm install --save-dev @babel/core
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-decorators
```

Configure Babel. For example:

**babel.config.js**

```js
const plugins = [
  ["@babel/plugin-proposal-class-properties", {"loose": true}],
  ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true } ],
];

module.exports = { plugins };
```

You can run Babel via a bundler plugin such as [rollup-plugin-babel](https://www.npmjs.com/package/rollup-plugin-babel), or from the command line. See the [Babel documentation](https://babeljs.io/docs/en/) for more information.

## Publishing best practices

The following are other good practices to follow when publishing reusable Web Components.

### Do not import polyfills into modules

Polyfills are an application concern, so the application should depend directly
on them, not individual packages. The exact polyfills needed often depends on
the browsers the application needs to support, and that choice is best left to
the application developer using your component.

Packages may need to depend on polyfills for tests and demos, so if
they're needed, they should only go in `devDependencies`.

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

### Include good TypeScript typings

TypeScript will infer the class of an HTML element returned from certain DOM
APIs based on the tag name. For example, `document.createElement('img')` returns
an `HTMLImageElement` instance with a `src: string` property.

Custom elements can get this same treatment by adding to the
`HTMLElementTagNameMap` as follows:

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number})
  aNumber: number = 5;
  /* ... */
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement,
  }
}
```

By doing this, the following code properly type-checks:

```ts
const myElement = document.createElement('my-element');
myElement.aNumber = 10;
```

We recommend adding an `HTMLElementTagNameMap` entry for all elements authored
in TypeScript, and ensuring you publish your `.d.ts` typings in your `npm`
package.

### Self-define elements

The module that declares the web component class should always include a call to
`customElements.define()` to define the element.

Work is progressing on adding [Scoped Custom Element
Registries](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md)
to the platform, wherein a custom element's tag name could be chosen by the
user of the component for a given shadow root scope. Once browsers start
shipping this feature, it will become practical to export the custom element
class separate from a side-effectful import that registers it globally with a
tag name.

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
