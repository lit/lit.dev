---
title: Development
eleventyNavigation:
  key: Development
  parent: Tools
  order: 3
---

During the development phase of your projects, when you're writing Lit components, the following tools can help boost your productivity:

* A dev server, for previewing code without a build step.
* TypeScript, for writing type-checked code.
* A linter, for catching Javascript errors.
* A code formatter, for consistently formatting code.
* Lit-specific IDE plugins, for linting and syntax-highlighting Lit templates.

Check out the [Getting Started](../../getting-started) documentation to easily setup a development environment with all of these features pre-configured.

## Development and Production Builds

All the Lit packages are published with development and production builds, using Node's support for [export conditions](https://nodejs.org/api/packages.html#packages_conditional_exports).

The production build is optimized with very aggressive minification settings. The development build is unminified for easier debugging and includes extra checks and warnings. The default build is the production build, so that projects don't accidentally deploy the larger development build.

You must opt into the developement build by specifying the `"development"` export condition in tools that support export conditions, such as Rollup, Webpack, and Web Dev Server. This is done differently for each tool.

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
    dedupe: true,
  },
  esbuildTarget: 'auto',
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

To invoke it:

```bash
npx eslint yourfile.js
```

For full installation and usage instructions, see the [ESLint documentation](https://eslint.org/docs/user-guide/getting-started).

Integrating linting into your IDE workflow can help catch errors as early as possible. See [Lit-specific IDE plugins](#ide-plugins) to configure linting specifically for Lit.

## Source formatting { #formatting }

Using a code formatter can help ensure code is consistent and readable. Integrating your formatter of choice with your IDE ensures your code is always clean and tidy.

A few popular options include:

* [Prettier](https://prettier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
* [Beautifier](https://beautifier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
* [Clang](https://www.npmjs.com/package/clang-format): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)


## Lit-specific IDE plugins { #ide-plugins }

There are a number of IDE plugins that may be useful when developing with Lit. In particular, we recommend using a syntax highlighter that works with Lit templates.

The following plugins highlight Lit templates and check them for errors:

* [`lit-plugin` for VS Code](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)

* [`ts-lit-plugin` for TypeScript](https://github.com/runem/lit-analyzer/tree/master/packages/ts-lit-plugin) (works with Sublime and Atom)

* [`eslint-plugin-lit` for ESLint](https://github.com/43081j/eslint-plugin-lit)

These plugins provide:

- Syntax highlighting
- Type-checking
- Code completion
- Hover-over docs
- Jump to definition
- Linting
- Quick Fixes

See the [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html#ide-plugins) repo for other IDE plugins, as well as additional tools and information.
