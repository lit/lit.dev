---
title: 开发
eleventyNavigation:
  key: 开发
  parent: 工具
  order: 3
versionLinks:
  v1: lit-html/tools/#development
---

在项目的开发阶段，当你编写 Lit 组件时，以下工具可以帮助你提高生产力：

* 一个 dev server，用于在没有构建步骤的情况下预览代码。
* TypeScript，用于编写类型检查的代码。
* 一个 linter，用于捕获 Javascript 错误。
* 代码格式化程序，用于一致地格式化代码。
* Lit 特定的 IDE 插件，用于 linting 和 Lit 模板的语法高亮。

查看 [Starter Kits]({{baseurl}}/docs/tools/starter-kits/) 文档，可以轻松地通过预配置项来培植出包含上述所有功能的开发环境。

## 开发和生产构建 {#development-and-production-builds}

所有的 Lit 包都使用 Node 支持的 [导出条件](https://nodejs.org/api/packages.html#packages_conditional_exports) 进行发布，并同时发布开发和生产两个版本。

生产构建通过非常激进的压缩设置进行了优化。 而开发版本没有使用压缩，这样是为了便于调试，并能够提供额外的检查和警告。 Lit的默认构建是生产构建，因此项目不会意外部署相对更大的开发构建。

你必须在支持导出条件的工具（例如 Rollup、Webpack 和 Web Dev Server）中通过指定 `"development"` 导出条件来选择开发构建。 每种工具的配置方式可能不一样。

例如，在 Rollup 中，需要用到 `@rollup/node-resolve` 插件，通过配置 `exportConditions` 选项选择开发构建：

```js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  // ...
  plugins: [nodeResolve({
    exportConditions: ['development']
  })]
};
```

### 开发构建中的运行时警告 {#development-build-runtime-warnings}

`ReactiveElement` 和 `LitElement` 的开发版本支持额外的运行时警告，有助于识别在生产版本中检查成本很高的问题。

有一些警告总是会显示出来。但是还有两类 _可选警告_ 可以打开或关闭：
* `'migration'`。从 LitElement 2.x 迁移的相关警告。默认关闭。
* `'change-in-update'`。更新期间更改响应式状态的相关警告。默认开启。

你可以使用 `ReactiveElement.disableWarning()` 和 `ReactiveElement.enableWarning()` 方法控制可选警告。你可以在 `ReactiveElement` 的任何子类上调用它们，包括 `LitElement` 和你自己的类。调用类的方法会打开/关闭该类及其任何子类的警告。例如，你可以关闭所有的 `ReactiveElement` 类、`LitElement` 类或特定的 `LitElement` 子类的警告类别。

这些方法仅在开发版本中可用，因此请务必管理好它们的访问权限。通常，我们建议通过可选链来实现。

Examples:
```ts
import {LitElement, ReactiveElement} from 'lit';

// 关闭所有的 ReactiveElement 的迁移警告，包括 LitElement
ReactiveElement.disableWarning?.('migration');

// 关闭所有 LitElement 的更新警告
LitElement.disableWarning?.('change-in-update');

// 关闭元素上的更新警告
MyElement.disableWarning?.('change-in-update');

```

你还可以通过定义 `static enabledWarnings` 属性来控制单个类中的警告：

```ts
class MyElement extends LitElement {
  static enabledWarnings = ['migration'];
}
```

如果在你自己的生产构建中消除了控制警告的代码，这将有效减轻代码包的体量。

## 本地 dev server { #devserver }

Lit 被打包为 JavaScript 模块，它使用大多数浏览器尚未原生支持的裸模块说明符。裸说明符是最常被使用的，你可能也希望在自己的代码中使用它们。 例如：

```js
从'lit'导入{LitElement，html，css}；
```

想要在浏览器中运行上面的代码，需要将裸说明符（`'lit'`）转换为浏览器可以加载的 URL（例如 `'/node_modules/lit/lit.js'`）。

目前，有许多开发服务器可以处理模块说明符。 如果你已经有了一个开发服务器，它能够执行转换操作并与你的构建过程集成，那应该就足够了。

如果你需要开发服务器，我们推荐使用 [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/)。

### Web Dev Server { #web-dev-server }

[Web Dev Server](https://modern-web.dev/docs/dev-server/overview/) 是一个开源的开发服务器，可实现免构建的开发流程。

它可以根据浏览器的要求将裸模块说明符重写为有效的 URL。

安装 Web Web Dev Server：

```bash
npm i @web/dev-server --save-dev
```

将命令添加到 `package.json` 文件：

```json
"scripts": {
  "start": "web-dev-server"
}
```

新增 `web-dev-server.config.js` 文件：

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

运行 dev server：

```bash
npm run start
```

#### 旧版浏览器支持

对于像 IE11 这样的旧版浏览器，Web Dev Server 也可以转换 JavaScript 模块，然后使用向后兼容的 SystemJS 模块加载器来加载，并自动为 Web 组件提供 polyfill。但是，为了实现对旧版浏览器的支持，你还需要对 `@web/dev-server-legacy` 包进行配置。

安装 Web Dev Server 旧包：

```bash
npm i @web/dev-server-legacy --save-dev
```

配置 `web-dev-server.config.js`:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  // ...
  plugins: [
    // 确保这个插件总是放在最后
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        // 将 lit 的 polyfill-support 模块注入到测试文件中，这是与 webcomponents 的 polyfill 交互所必需的
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

有关完整的安装和使用说明，请参阅 [Web Dev Server 文档](https://modern-web.dev/docs/dev-server/overview/)。

## TypeScript { #typescript }

TypeScript 通过添加对类型的支持来扩展 Javascript 语言。 类型有助于及早发现错误，并使代码更具可读性和可理解性。

在项目中安装 TypeScript：

```bash
npm install typescript --save-dev
```

构建代码：

```bash
npx tsc --watch
```

有关完整的安装和使用说明，请参阅 [TypeScript 站点](https://www.typescriptlang.org/)。 想要开始使用Tyscript，请参阅 [安装 TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html) 和 [使用功能](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)，这些文档特别有用。

## JavaScript 和 TypeScript lint { #linting }

Lint 可以帮助你捕获代码中的错误。 我们建议使用 [ESLint](https://eslint.org) 对 Lit 进行代码检查

在你的项目中安装 ESLint：

```bash
npm install eslint --save-dev
npx eslint --init
```

运行 ESLint：

```bash
npx eslint yourfile.js
```

或者将其添加到 npm 脚本中：

```json
{
   "scripts"：{
     "lint": "eslint \"**/*.{js,ts}\"",
   }
}
```

有关完整的安装和使用说明，请参阅 [ESLint 文档](https://eslint.org/docs/user-guide/getting-started)。

我们还推荐 [`eslint-plugin-lit` for ESLint](https://www.npmjs.com/package/eslint-plugin-lit)，它为 Lit 的 HTML 模板提供代码检查，包括常规的 HTML 检查以及 Lit 特定规则的检查。

将代码检查集成到 IDE 工作流程中有助于尽早发现错误。 请参阅 [Lit-specific IDE plugins](#ide-plugins) 为 Lit 配置你的 IDE。

## 代码格式化 { #formatting }

使用代码格式化工具可以帮助你保持代码的一致性和可读性。 将你选择的格式化工具集成到你的 IDE 中，可确保你的代码始处于终干净整洁的状态。

一些流行的工具包括：

* [Prettier](https://prettier.io/): [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
* [Beautifier](https://beautifier.io/): [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
* [Clang](https://www.npmjs.com/package/clang-format): [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format)


## Lit 专属的 IDE 插件 { #ide-plugins }

在使用 Lit 进行开发时，有许多 IDE 插件可能很有用。 我们尤其建议使用适用于 Lit 模板的语法高亮工具。

### lit-plugin

`lit-plugin` 为 Lit 模板提供语法高亮、类型检查等功能。 它是 [适用于 VS Code](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)，或者，你也可以在 Sublime Text 和 Atom 中使用 [`ts-lit-plugin` TypeScript 编译器插件](https://github.com/runem/lit-analyzer/tree/master/packages/ts-lit-plugin)。

`lit-plugin` 和 `ts-lit-plugin` 的功能有：

- 语法高亮
- 类型检查
- 代码补全
- 悬停文档
- 跳转到定义
- Linting
- 快速修复

### ESLint

ESLint 已经 [集成](https://eslint.org/docs/user-guide/integrations#editors) 到了许多代码编辑器中。 如果你在 ESLint 配置中安装了 [`eslint-plugin-lit` for ESLint](https://www.npmjs.com/package/eslint-plugin-lit)，那么你的 IDE 将会显示 Lit 特定的错误和警告。

### 其他插件 {#other-plugins}

有关其他 IDE 插件以及其他工具和信息，请参阅 [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html#ide-plugins) 仓库。
