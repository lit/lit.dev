---
title: Development
eleventyNavigation:
  key: Development
  parent: Tools
  order: 2
---

{% todo %}

- Rough content from lit-html docs follows. Update & edit this content for Lit.
- ES dev server => web-dev-server
- Add content on Using TypeScript?

{% endtodo %}


During the development phase, you might want the following tools:

* IDE plugins, for linting and code highlighting.
* Linter plugins, for checking lit-html templates.
* A dev server, for previewing code without a build step.


## IDE plugins

There are a number of IDE plugins that may be useful when developing with lit-html. In particular, we recommend using a code highlighter that works with lit-html style templates. In addition, we recommend using a linter like ESLint that supports modern JavaScript.

The following VS Code and TypeScript plugins check lit-html templates for errors:

* [VS Code plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)

* [TypeScript plugin (works with Sublime and Atom)](https://github.com/runem/lit-analyzer/tree/master/packages/ts-lit-plugin)

More plugins

The [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html#ide-plugins) repo lists other IDE plugins.


## Linting

ESLint is recommended for linting lit-html code.  The following ESLint plugin can be added to check for some common issues in lit-html templates:

* [https://github.com/43081j/eslint-plugin-lit](https://github.com/43081j/eslint-plugin-lit)

Another alternative is to use the `lit-analyzer` CLI alongside ESLint to detect issues in your lit-html templates:

* [https://github.com/runem/lit-analyzer/tree/master/packages/lit-analyzer](https://github.com/runem/lit-analyzer/tree/master/packages/lit-analyzer)

`lit-analyzer` uses the same backend as the VS Code and TypeScript plugins listed in [IDE plugins](#ide-plugins).

## Dev server

lit-html is packaged as JavaScript modules. Many developers prefer to import modules using bare module specifiers:

```js
import {html, render} from 'lit-html';
```

To run in the browser, the bare identifier ('lit-html') needs to be transformed to a path or URL that the browser can load (such as '/node_modules/lit-html/lit-html.js'). [ES dev server](https://open-wc.org/developing/es-dev-server.html) is an open-source dev server that handles this and other transforms.

You can also use the Polymer CLI dev server, if you already have it installed. For new projects, we recommend the ES dev server.

If you already have a dev server that integrates with your build process, you can use that, instead.

### ES Dev Server

The ES dev server enables a build-free development process. It handles rewriting bare module specifiers to valid paths or URLs, as required by the browser. For IE11, ES dev server also transforms JavaScript modules to use the backwards-compatible SystemJS module loader.

Install ES dev server:

```bash
npm i -D es-dev-server
```

Add a command to your `package.json` file:

```json
"scripts": {
  "start": "es-dev-server --app-index index.html --node-resolve --watch --open"
}
```

Run the dev server:

```bash
npm run start
```

For full installation and usage instructions, see the [open-wc website](https://open-wc.org/developing/es-dev-server.html).

## Using TypeScript

TODO
