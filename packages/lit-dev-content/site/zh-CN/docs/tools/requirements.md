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

支持旧版浏览器（特别是 Internet Explorer 11，还有旧版的常青浏览器（evergreen browser）），需要一些额外的步骤：

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
| Edge "classic"    |              | <=18                          |
| Internet Explorer |              | 11                            |

### 编译为 ES5 {#compiling-to-es5}

Rollup、webpack 和其他构建工具都有插件支持为旧浏览器编译现代 JavaScript。 [Babel](https://babeljs.io/) 是最常用的编译器。

与某些库不同，Lit 使用现代 ES2019 JavaScript 以一组 ES 模块发布。 当你为旧版浏览器构建应用时，需要编译 Lit 以及自己的代码。

如果你已经有了配置过构建，可能会将其配置为在编译时忽略 `node_modules` 文件夹。 如果是这种这样，我们建议更新它，让其编译 `lit` 包及其运行时依赖项（`lit-html` 和 `lit-element`）。 例如，如果你使用 [Rollup Babel 插件](https://www.npmjs.com/package/@rollup/plugin-babel)，你可能采用如下配置来排除编译 `node_modules` 文件夹：

```js
exclude: [ 'node_modules/**' ]
```

你可以将其替换为明确包含要编译的文件夹的规则：

```js
include: [
  'src/**',
  'node_modules/lit/**',
  'node_modules/lit-element/**',
  'node_modules/lit-html/**'
]
```

**为什么没有 ES5 构建？** Lit 包不包含 ES5 构建，因为现代 JavaScript 更小且通常更快。 在构建应用时，你可以根据需要支持的浏览器来编译现代 JavaScript，从而创建你需要的确切构建（或多个构建）。

如果 Lit 包含多个构建，则单个元素可能最终取决于 Lit 的不同构建——导致库的多个版本被传送到浏览器。

### 转换模块 {#transforming-modules}

在为不支持模块的旧版浏览器（如：IE11）生成输出时，有三种常见的输出格式：

* 没有模块（IIFE）。 代码打包为单个文件，包装在立即执行函数 (IIFE) 中。
* AMD 模块。 使用异步模块定义格式； 需要一个模块加载器脚本，例如 [require.js](https://requirejs.org/)。
* SystemJS 模块。 [SystemJS](https://www.npmjs.com/package/systemjs) 是一个模块加载器，它定义了自己的模块格式。 它还支持 AMD、CommonJS 和标准 JavaScript 模块。

如果你的所有代码都可以打包到一个文件中，那么 IIFE 格式可以正常工作。 如果你要通过 [动态 `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) 实现支持IE11 等旧版浏览器的代码拆分并，那么你需要以 AMD 或 SystemJS 模块格式生成输出并加载适当的模块加载器/polyfill。

## Polyfills {#polyfills}

在旧版浏览器上使用 Lit 需要为标准 JavaScript 功能加载 polyfill，如 Promises，async/await 和 Web 组件 polyfill，以及 Lit 包提供用于将 Lit 与 Web 组件 polyfill 连接的 `polyfill-support` 脚本。

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

* JavaScript 特性的 polyfill：
   * [`core-js`](https://www.npmjs.com/package/core-js) - 标准 JS 库
   * [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) - 支持 generator 和 async/await
* 动态 `import()` 的 polyfill（如果应用程序中用到，需要根据模块的转换方式进行选择）：
   * [`systemjs`](https://www.npmjs.com/package/systemjs) - systemjs 模块加载器
   * [`requirejs`](https://www.npmjs.com/package/requirejs) - AMD 模块加载器
* Web 组件的 polyfill：
   * [`@webcomponents/webcomponentsjs`](https://www.npmjs.com/package/@webcomponents/webcomponentsjs) - 用于自定义元素、shadow DOM、模板和一些较新的 DOM API 的 polyfill
   * `lit/polyfill-support.js` - `lit` 包中附带的文件，使用 `webcomponentsjs` 时必须加载该文件

请注意，应用程序使用的功能不同，可能还需要其他不同的 polyfill。

### 加载 polyfill

Javascript polyfill 应该与应用程序包分开打包，并在 web 组件 polyfill 之前加载，因为组件的 polyfill 依赖于现代 JS，如 `Promise`。 总而言之，页面应该加载如下代码：

```html
<script src="path/to/js/polyfills/you/need.js"></script>
<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Load application code here -->
```

### Web 组件 polyfill

有关加载和配置 Web 组件 polyfill 的详细信息，请参阅 [webcomponentsjs 文档](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)。 以下是一些关键点的总结。

#### 加载选项

加载 Web 组件 polyfill 的主要方法有两种：

- `webcomponents-bundle.js` 包括在任何受支持的浏览器上运行所需的所有 polyfill。 因为所有浏览器都会收到所有的 polyfill，这会导致即使浏览器原生支持部分功能，但是也会所有的polyfill的代码。
- `webcomponents-loader.js` 执行客户端功能检测并仅加载所需的 polyfill。 这虽然增加了到服务器的额外往返行程，但为支持部分功能的浏览器节省了带宽。

#### 加载 ES5 适配器

最好为现代浏览器提供现代版本，以避免发送旧浏览器所需的额外代码。 但是，只提供一组文件的话会更加方便。 如果你想这样做，则需要一个额外的步骤。 为了使 ES5 编译的代码能够与本机 Web 组件和（特别是）自定义元素一起使用，需要一个小型适配器。 详细解释请看【webcomponentsjs 文档】(https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs#custom-elements-es5-adapterjs)。

请注意，你需要在所有的 Babel polyfill 之后和 Web 组件之前加载 `custom-elements-es5-adapter.js`，如下所示：

```html
<script src="path/to/js/polyfills/you/need.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
<script src="node_modules/lit/polyfill-support.js"></script>
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
<!-- Load application code here -->
```

#### 设置 Web 组件 polyfill 选项

By default, the individual polyfill for a given feature is disabled on browsers that natively support that feature.
For testing purposes, you can force the polyfills on for browsers that have native support.

While the web components polyfills strive to match the spec, there are some infidelities particularly around styling (see [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations)). We recommend ensuring you test with polyfills both on and off, either on the browsers that need them, or by forcing them on. You can force the polyfills on by adding a JavaScript snippet before you import the polyfills:

默认情况下，在本机支持某项功能的浏览器上禁用对应功能的单个 polyfill。
出于测试目的，你可以为原生支持某些功能的浏览器强制启用 polyfill。

虽然 web 组件 polyfill 已经努力匹配规范，但在样式方面存在一些缺陷（参见 [ShadyCSS 限制](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations)）。 我们建议你在确保需要它们的浏览器上或强制打开它们时，通过打开和关闭 polyfill 进行测试。 在导入 polyfill 之前，你可以通过添加 JavaScript 片段来强制启用 polyfill：

```html
<script>
  // 强制启用所有 polyfill
  if (window.customElements) window.customElements.forcePolyfill = true;
  ShadyDOM = { force: true };
  ShadyCSS = { shimcssproperties: true};
</script>
<script src="./node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
```

或者，如果你使用 `webcomponents-bundle.js` 文件，可以通过将 query 参数添加到应用程序的 URL 来强制启用 polyfill：

`https://www.example.com/my-application/view1?wc-ce&wc-shadydom&wc-shimcssproperties`

下表列出了每个 polyfill 的 JavaScript 片段和查询参数。

| Polyfill    | Javascript                          | Query parameter          |
|:------------|:------------------------------------|:-------------------------|
| Custom Elements | `if (window.customElements) window.customElements.forcePolyfill = true;` | `wc-ce` |
| Shadow DOM | `ShadyDOM = { force: true };` | `wc-shadydom`              |
| CSS custom properties | `ShadyCSS = { shimcssproperties: true};` | `wc-shimcssproperties` |
