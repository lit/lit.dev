---
title: 要求
eleventyNavigation:
  key: 要求
  parent: 工具
  order: 2
versionLinks:
  v1: tools/build/#build-requirements
---

 为了使用各种浏览器和工具，需要了解一下 Lit 最重要的事情：

  * Lit 基于 ES2019 发布。
  * Lit 使用“bare”模块说明符（bare module specifier）来导入模块。
  * Lit 使用现代 Web API，例如 `<template>`、自定义元素、shadow DOM 和 `ParentNode`。

最新版本的主要浏览器（包括 Chrome、Edge、Safari 和 Firefox）和最流行的工具（例如 Rollup、Webpack、Babel 和 Terser）都支持这些功能——浏览器中的裸模块说明符支持除外。

使用 Lit 开发应用程序时，你的目标浏览器需要原生支持这些功能，或者你需要用工具处理使浏览器支持它们。 虽然有大多浏览器对现代 Web 功能提供各种支持，但为简单起见，我们建议将浏览器分为以下两个类：

*  **现代浏览器** 支持 ES2019 和 Web 组件。 必须使用工具解析裸模块说明符。
*  **旧版浏览器** 支持 ES5，不支持 Web 组件或新的 DOM API。 必须使用工具编译 JavaScript 并加载 polyfill。

本页概述了如何在你的开发和生产环境中满足这些要求。

有关满足这些要求的工具和配置的建议，请参阅 [开发]({{baseurl}}/docs/tools/development/)、[测试]({{baseurl}}/docs/tools/testing/) 和 [构建生产]({{baseurl}}/docs/tools/production/) 要求。

## 现代浏览器的要求 {#building-for-modern-browsers}

在现代浏览器上使用 Lit 所需的唯一转换是将裸模块说明符转换为与浏览器兼容的 URL。

Lit 使用裸模块说明符在其子包之间导入模块，如下所示：

```js
import {html} from 'lit-html';
```

现代浏览器目前仅支持从 URL 或相对路径加载模块，不能直接引用 npm 包的裸名，因此构建系统需要处理它们。 构建系统要么将说明符转换为适用于浏览器中的 ES 模块的说明符，或者生成不同类型的模块作为输出。

Webpack 能自动处理裸模块说明符； 而 Rollup，则需要插件 ([@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve))。

**为什么要使用裸模块说明符？** 裸模块说明符可以让你在不知道包管理器将模块安装在何处的情况下导入它们。 名为 [Import maps](https://github.com/WICG/import-maps) 的标准提案叫做 [starting to ship](https://chromestatus.com/feature/5315286962012160)，它将让浏览器支持裸模块说明符。 同时，裸导入说明符可以很容易地转换为构建步骤。 还有一些支持 import maps 的 polyfill 和模块加载器。

### 现代浏览器细分

所有现代浏览器都会自动更新，用户很可能拥有的是最新版本。 下表列出了原生支持 ES2019 和 Web 组件的每个主要浏览器的最低版本，这是 Lit 所依赖的关键特性。

| 浏览器 | 支持 ES2019 和 Web 组件 |
|:--------|:--------------------------------:|
| Chrome  |	>=73                             |
| Safari  |	>=12.1                           |
|	Firefox |	>=63                             |
|	Edge    |	>=79                             |

## 旧版浏览器的要求 {#building-for-legacy-browsers}

支持旧版浏览器（特别是 Internet Explorer 11，还有旧版的常青浏览器（evergreen browsers）），需要一些额外的步骤：

* 将现代 JavaScript 语法编译为 ES5。
* 将 ES 模块转换为另一个模块系统。
* 加载 polyfill。

### 旧版浏览器细分

下表列出了需要编译 Javascript 和加载 polyfill 的受支持浏览器版本：

| 浏览器 | 编译 JS | 编译 JS 并加载 polyfills |
|:------------------|:------------:|:-----------------------------:|
| Chrome            | 67-79        | <67                           |
| Safari            | 10-12        | <10                           |
| Firefox           | 63-71        | <63                           |
| Edge              | 79           |                               |
| Edge "classic"    |              | <=18                         |
| Internet Explorer |              | 11                            |

### 编译为 ES5 {#compiling-to-es5}

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
