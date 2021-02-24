---
title: Development
eleventyNavigation:
  key: Development
  parent: Tools
  order: 2
---

During the development phase of your projects when you're writing Lit components, the following tools can help boost your productivity:

* A dev server, for previewing code without a build step.
* TypeScript, for writing type-checked code.
* Lit-specific IDE plugins, for linting and syntax-highlighting Lit templates.
* A linter, for catching Javascript errors.
* A code formatter, for consistently formatting code.

Check out the [Getting Started](../../getting-started) documentation to easily setup a development environment with all of these features pre-configured.

## Using a dev server { #devserver }

Lit is packaged as JavaScript modules, and it uses bare module specifiers that are not yet natively supported in most browsers. Bare specifiers are commonly used, and you may want to use them in your own code as well. For example:

```js
import {LitElement, html, css} from 'lit';
```

To run this code in the browser, the bare specifier ('lit') needs to be transformed to a URL that the browser can load (such as '/node_modules/lit/lit.js').

There are many development servers that can deal with module specifiers. If you already have a dev server that does this and integrates with your build process, that should be sufficient.

If you need a dev server, we recommend [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/).

### Web Dev Server

[Web Dev Server](https://modern-web.dev/docs/dev-server/overview/) is an open-source dev server that enables a build-free development process.

It handles rewriting bare module specifiers to valid URLs, as required by browsers. For older browsers like IE11, Web Dev Server can transform JavaScript modules to use the backwards-compatible SystemJS module loader, and automatically serve the web components polyfills.

Install Web Dev Server:

```bash
npm i @web/dev-server --save-dev
```

Add a command to your `package.json` file:

```json
"scripts": {
  "start": "web-dev-server --node-resolve --app-index index.html --open --watch --esbuild-target auto"
}
```

Run the dev server:

```bash
npm run start
```

For full installation and usage instructions, see the [Web Dev Server documentation](https://modern-web.dev/docs/dev-server/overview/).

## Using TypeScript { #typescript }

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

## Using Lit-specific IDE plugins { #ide-plugins }

There are a number of IDE plugins that may be useful when developing with Lit. In particular, we recommend using a syntax highlighter that works with Lit templates.

The following VS Code and TypeScript plugins highlight Lit templates and check them for errors:

* [`lit-plugin` for VS Code](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)

* [`ts-lit-plugin` for TypeScript](https://github.com/runem/lit-analyzer/tree/master/packages/ts-lit-plugin) (works with Sublime and Atom)

These plugins provide:

- Syntax highlighting
- Type-checking
- Code completion
- Hover-over docs
- Jump to definition
- Linting
- Quick Fixes

See the [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html#ide-plugins) repo for other IDE plugins, as well as additional tools and information.

## Setting up Javascript linting { #linting }

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

### Using Linting plugins

Integrating linting into your IDE workflow can help catch errors as early as possible, right when you're typing out your code. The following ESLint plugin can be added to check for some common issues in Lit templates:

* [https://github.com/43081j/eslint-plugin-lit](https://github.com/43081j/eslint-plugin-lit)

## Setting up formatting { #formatting }

Using a code formatter can help ensure code is consistent and readable. Integrating your formatter of choice with your IDE ensures your code is always clean and tidy.

A few popular options include:

* [Prettier](https://prettier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
* [Beautifier](https://beautifier.io/): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
* [Clang](https://www.npmjs.com/package/clang-format): [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)
