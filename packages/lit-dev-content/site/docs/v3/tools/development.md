---
title: Development
eleventyNavigation:
  key: Development
  parent: Tools
  order: 3
versionLinks:
  v1: lit-html/tools/#development
  v2: tools/development/
---

During the development phase of your projects, when you're writing Lit components, the following tools can help boost your productivity:

* A dev server, for previewing code without a build step.
* TypeScript, for writing type-checked code.
* A linter, for catching Javascript errors.
* A code formatter, for consistently formatting code.
* Lit-specific IDE plugins, for linting and syntax-highlighting Lit templates.

Check out the [Starter Kits](/docs/v3/tools/starter-kits/) documentation to easily setup a development environment with all of these features pre-configured.

## Development and production builds

All the Lit packages are published with development and production builds, using Node's support for [export conditions](https://nodejs.org/api/packages.html#packages_conditional_exports).

The production build is optimized with very aggressive minification settings. The development build is unminified for easier debugging and includes extra checks and warnings. The default build is the production build, so that projects don't accidentally deploy the larger development build.

You must opt into the development build by specifying the `"development"` export condition in tools that support export conditions, such as Rollup, Webpack, and Web Dev Server. This is done differently for each tool.

For example, in Rollup, using the `@rollup/node-resolve` plugin, you can select the development build with `exportConditions` option:

```js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  // ...
  plugins: [nodeResolve({
    exportConditions: ['development']
  })]
};
```

### Development build runtime warnings

The development builds of `ReactiveElement` and `LitElement` support extra runtime warnings that can help identify issues that would be costly to check for in production builds.

Some warnings are always displayed.  There are also two categories of _optional warnings_ that can be turned on or off:
* `'migration'`. Warnings related to migration from LitElement 2.x. Off by default.
* `'change-in-update'`. Warnings related to changing reactive state during an update. On by default.

You can control the optional warnings using the `ReactiveElement.disableWarning()` and `ReactiveElement.enableWarning()` methods. You can call them on any subclass of `ReactiveElement`, including `LitElement` and your own classes. Calling the methods on a given class turns warnings on or off for and the warnings for that class and any subclasses. For instance, you can turn off a category of warnings on all `ReactiveElement` classes, on all `LitElement` classes, or on a specific `LitElement` subclass.

These methods are only available in development builds, so be sure to guard their access. We recommend using optional chaining.

Examples:
```ts
import {LitElement, ReactiveElement} from 'lit';

// Turn off migration warnings on all ReactiveElements,
// including LitElements
ReactiveElement.disableWarning?.('migration');

// Turn off update warnings on all LitElements
LitElement.disableWarning?.('change-in-update');

// Turn off update warnings on one element
MyElement.disableWarning?.('change-in-update');

```

You can also control warnings within a single class by defining a `static enabledWarnings` property:

```ts
class MyElement extends LitElement {
  static enabledWarnings = ['migration'];
}
```

It's best for code size if the code to control warnings is eliminated in your own production builds.

#### Multiple versions of Lit warning {#multiple-lit-versions}

A dev mode only warning is triggered when multiple versions, or even multiple copies of the same version, of any of the Lit core packages – `lit-html`, `lit-element`, `@lit/reactive-element` – are detected.

If Lit is being used as an internal dependency of elements, elements can use different versions of Lit and are completely interoperable.
We also take care to ensure that Lit 2 and Lit 3 are mostly compatible with each other. For example, you can pass a Lit 2 template into a Lit 3 render function and vice-versa.

So, why the warning? Lit is sometimes compared to frameworks which often break if components using different framework versions are mixed together. Thus, it's easier to accidentally install multiple duplicated versions of Lit without realizing.

Loading multiple compatible versions of Lit is non-optimal because extra duplicated bytes must be sent to the user.

If you’re publishing a library that uses Lit, follow our [publishing best practices](https://lit.dev/docs/tools/publishing/#don't-bundle-minify-or-optimize-modules) so consumers of your library are able to de-duplicate Lit in their projects.

##### Resolving multiple versions of Lit

It is possible to follow the steps below, and not be able to de-duplicate Lit, e.g., a library you depend on is bundling a specific version of Lit. In these cases the warning can be ignored.

If you’re seeing a `Multiple versions of Lit loaded` development mode warning, there are a couple things you can try:

1. Find out which Lit libraries have multiple versions loaded by checking the following variables in your browser console: `window.litElementVersions`, `window.reactiveElementVersions`, and `window.litHtmlVersions`.

2. Use `npm ls` (note, you can specify exact libraries to look for, e.g. `npm ls @lit/reactive-element`) to narrow down which dependencies are loading multiple different versions of Lit.

3. Try to use `npm dedupe` to de-duplicate Lit. Use `npm ls` to verify if the duplicated Lit package was successfully de-duped.

4. It is possible to nudge `npm` to hoist particular versions of the core Lit packages by installing them as direct dependencies of your project with `npm i @lit/reactive-element@latest lit-element@latest lit-html@latest`. Replace `latest` with the version you want to de-dupe to.

5. If there is still duplication, you may need to delete your package lock and `node_modules`. Then install the version of `lit` you want explicitly, followed by your dependencies.


## Local dev servers { #devserver }

Lit is packaged as JavaScript modules, and it uses bare module specifiers that are not yet natively supported in most browsers. Bare specifiers are commonly used, and you may want to use them in your own code as well. For example:

```js
import {LitElement, html, css} from 'lit';
```

To run this code in the browser, the bare specifier (`'lit'`) needs to be transformed to a URL that the browser can load (such as `'/node_modules/lit/lit.js'`).

There are many development servers that can deal with module specifiers. If you already have a dev server that does this and integrates with your build process, that should be sufficient.

If you need a dev server, we recommend [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/).

### Web Dev Server { #web-dev-server }

[Web Dev Server](https://modern-web.dev/docs/dev-server/overview/) is an open-source dev server that enables a build-free development process.

It handles rewriting bare module specifiers to valid URLs, as required by browsers.

Install Web Dev Server:

```bash
npm i @web/dev-server --save-dev
```

Add a command to your `package.json` file:

```json
"scripts": {
  "start": "web-dev-server"
}
```

And a `web-dev-server.config.js` file:
```js
export default {
  open: true,
  watch: true,
  appIndex: 'index.html',
  nodeResolve: {
    exportConditions: ['development'],
  },
};
```

Run the dev server:

```bash
npm run start
```

#### Legacy browser support

For older browsers like IE11, Web Dev Server can transform JavaScript modules to use the backwards-compatible SystemJS module loader, and automatically serve the web components polyfills. You'll need to configure the `@web/dev-server-legacy` package to support older browsers.

Install the Web Dev Server legacy package:

```bash
npm i @web/dev-server-legacy --save-dev
```

Configure `web-dev-server.config.js`:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  // ...
  plugins: [
    // Make sure this plugin is always last
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        // Inject lit's polyfill-support module into test files, which is required
        // for interfacing with the webcomponents polyfills
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
  ],
};
```

For full installation and usage instructions, see the [Web Dev Server documentation](https://modern-web.dev/docs/dev-server/overview/).

## TypeScript { #typescript }

TypeScript extends the Javascript language by adding support for types. Types are useful for catching errors early and making code more readable and understandable.

To install TypeScript in your project:

```bash
npm install typescript --save-dev
```

To build the code:

```bash
npx tsc --watch
```

For full installation and usage instructions, see the [TypeScript site](https://www.typescriptlang.org/). To get started, the sections on [installing TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html) and [using its features](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) are particularly helpful.

## JavaScript and TypeScript linting { #linting }

Linting can help catch errors in your code. We recommend using [ESLint](https://eslint.org) for linting Lit code.

To install ESLint in your project:

```bash
npm install eslint --save-dev
npx eslint --init
```

To run it:

```bash
npx eslint yourfile.js
```

Or add it to your npm scripts:

```json
{
  "scripts": {
    "lint": "eslint \"**/*.{js,ts}\"",
  }
}
```

For full installation and usage instructions, see the [ESLint documentation](https://eslint.org/docs/user-guide/getting-started).

We also recommend the [`eslint-plugin-lit` for ESLint](https://www.npmjs.com/package/eslint-plugin-lit) which provides linting for Lit's HTML templates, inlcluding common HTML linting checks plus Lit-specific rules.

Integrating linting into your IDE workflow can help catch errors as early as possible. See [Lit-specific IDE plugins](#ide-plugins) to configure your IDE for Lit.

## Source formatting { #formatting }

Using a code formatter can help ensure code is consistent and readable. Integrating your formatter of choice with your IDE ensures your code is always clean and tidy.

A few popular options include:

* [Prettier](https://prettier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
* [Beautifier](https://beautifier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
* [Clang](https://www.npmjs.com/package/clang-format): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)


## Lit-specific IDE plugins { #ide-plugins }

There are a number of IDE plugins that may be useful when developing with Lit. In particular, we recommend using a syntax highlighter that works with Lit templates.

### lit-plugin

`lit-plugin` provides syntax highlighting, type checking, and more for Lit templates. It's [available for VS Code](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin), or you can use the [`ts-lit-plugin` TypeScript compiler plugin](https://github.com/runem/lit-analyzer/tree/master/packages/ts-lit-plugin) which works with Sublime Text and Atom.

`lit-plugin` and `ts-lit-plugin` provide:

- Syntax highlighting
- Type-checking
- Code completion
- Hover-over docs
- Jump to definition
- Linting
- Quick Fixes

### ESLint

ESLint has [integrations](https://eslint.org/docs/user-guide/integrations#editors) for a number of code editors. If you have [`eslint-plugin-lit` for ESLint](https://www.npmjs.com/package/eslint-plugin-lit) installed in your ESLint configuration, your IDE will show the Lit specific errors and warnings.

### Other plugins

See the [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html#ide-plugins) repo for other IDE plugins, as well as additional tools and information.
