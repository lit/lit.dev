---
title: 发布
eleventyNavigation:
  key: 发布
  parent: 工具
  order: 5
versionLinks:
  v1: tools/publish/
---

This page provides guidelines for publishing a Lit component to [npm](https://www.npmjs.com/), the package manager used by the vast majority of Javascript libraries and developers. See [Starter Kits](/docs/tools/starter-kits/) for reusable component templates set up for publishing to npm.
本页是一个将 Lit 组件发布到 [npm](https://www.npmjs.com/) 的指南，npm 是绝大多数 Javascript 库和开发人员使用的包管理器。 请参阅 [Starter Kits]({{baseurl}}/docs/tools/starter-kits/) ，这里有许多为发布到 npm 而设置的可重用组件模板。

## 发布到 npm

请参阅 [贡献 npm 包的说明](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)，了解更多将组件发布到 npm 的信息。

你的 package.json 配置应该包含 `type`、`main` 和 `module` 字段：

**package.json**

```json
{
  "type": "module",
  "main": "my-element.js",
  "module": "my-element.js"
}
```

你还应该创建一个 README 文件来描述如何使用组件。

## 发布现代 JavaScript

我们建议以标准 [ES2019](https://kangax.github.io/compat-table/es2016plus/) 语法发布 JavaScript 模块，因为所有常青浏览器（evergreen browser）都支持 ES2019，并采用 ES2019 可以得到最快、最小的 JavaScript。 用户可以使用编译器（编译ES2019代码）来支持旧版浏览器，但如果你在发布之前预编译代码，那么用户无法将旧版 JavaScript 转换为现代语法。

需要注意一点，如果你使用新提案或非标准的 JavaScript 功能，例如 TypeScript、装饰器和类字段，你应该在发布到 npm 之前将这些功能编译为浏览器本机支持的标准 ES2019。

### 用 TypeScript 编译

以下 JSON 示例是 `tsconfig.json` 的一部分，是编译为 ES2019 的推荐选项，启用装饰器编译，并为用户输出 `.d.ts` 类型：

**tsconfig.json**

```json
"compilerOptions": {
  "target": "es2019",
  "module": "es2015",
  "moduleResolution": "node",
  "lib": ["es2019", "dom"],
  "declaration": true,
  "declarationMap": true,
  "experimentalDecorators": true,
  "useDefineForClassFields": false
}
```

请注意，仅当 `target` 设置为 `esnext` 或更高时才需要将 `useDefineForClassFields` 设置为 `false`，但建议明确确保此设置为 `false`。

从 TypeScript 编译时，您应该包含声明文件
（根据上面的 `declaration: true` 生成）在 `package.json` 的`types` 字段中为您的组件类型，并确保 `.d.ts` 和 `.d.ts.map` 文件发布为 出色地：

**package.json**
```json
{
  ...
  "types": "my-element.d.ts"
}
```

有关详细信息，请参阅 [tsconfig.json 文档](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。

### 用 Babel 编译

可以使用 Babel 编译使用到 ES2019 中尚未包含且处于提案中的 JavaScript 功能的 Lit 组件。

安装 Babel 和你需要的 Babel 插件。 例如：

```sh
npm install --save-dev @babel/core
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-proposal-decorators
```

配置 Babel。 例如：

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

你可以通过 [@rollup/plugin-babel](https://www.npmjs.com/package/@rollup/plugin-babel) 等打包程序插件或从命令行运行 Babel。 有关详细信息，请参阅 [Babel 文档](https://babeljs.io/docs/en/)。

## 发布的最佳实践

以下是发布可重用 Web 组件时要遵循的其他良好实践。

### 不要将 polyfill 导入模块中

Polyfill 是应用程序的关注点，因此应用程序应该直接依赖于它们，而不是单独的包。 所需的确切 polyfill 通常取决于应用程序需要支持的浏览器，而这个选择最好留给使用你的组件的应用程序开发人员。

包可能需要依赖 polyfill 进行测试和演示，所以如果需要它们，它们应该只放在 `devDependencies` 中。

### 在导入说明符中包含文件扩展名

Node 模块解析不需要文件扩展名，因为如果没有给出扩展名的话，它就会搜索文件系统查找多个文件扩展名，并使用其中之一。当你导入 `some-package/foo` 时，如果存在 `some-package/foo.js`，Node 会导入它。同样，将包说明符解析为 URL 的构建工具也可以在构建时执行这种文件系统搜索。

但是，浏览器中 [starting to ship](https://chromestatus.com/feature/5315286962012160) 的 [import maps](https://github.com/WICG/import-maps) 规范通过在导入映射清单中提供导入说明符到 URL 的映射的方式， 允许浏览器从 _未转换的_ 源中加载带有裸包说明符的模块。

import maps 允许你将 import 映射到 URL，但只有两种类型的映射：精确映射和前缀映射。这意味着，在给定的包内，通过把包名映射为一个 URL 前缀，就能够很容易地给 _所有_ 模块起别名。但是，如果使用无文件扩展名导入，则意味着包中的 _每个文件_ 都需要 import maps 中的条目。这可能会使 import maps 变得臃肿。

因此，为了使你的源和 import maps 获得最佳兼容，我们建议在导入时采用带文件扩展名的方式。

### 发布 TypeScript 类型

为了使你的元素在 TypeScript 中易于使用，我们建议：

*   为所有使用 TypeScript 创作的元素添加一个 `HTMLElementTagNameMap` 条目。

    ```ts
    @customElement('my-element')
    export class MyElement extends LitElement { /* ... */ }

    declare global {
      interface HTMLElementTagNameMap {
        "my-element": MyElement;
      }
    }
    ```
*   在你的 npm 包中发布 `.d.ts` 类型。

 有关 `HTMLElementTagNameMap` 的更多信息，请参阅[提供良好的 TypeScript 类型]({{baseurl}}/docs/components/defining/#typescript-typings)。

### Self-define elements

声明 Web 组件类的模块应始终包含对 `customElements.define()`（或 `@customElement` 装饰器）的调用以定义元素。

目前，Web 组件总是在全局注册表中定义。每个自定义元素都需要使用唯一的标签名称**和**唯一的 JavaScript 类进行定义。如果尝试注册两次相同的标签名称，或注册两次相同的类都将失败并出现错误。简单地导出一个类并期望用户调用 `define()` 的做法是不保险的。因为如果两个不同的组件都依赖于共享的第三个组件，并且都试图定义它，那么其中一个组件将会失败。如果元素总是在声明其类的同一模块中定义，这不是问题。

这种方法的一个缺点是，如果两个不同的元素使用相同的标签名称，那么，它们就不能同时导入到同一个项目中。

将 [自定义元素作用域注册表](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md) 添加到平台的工作正在取得进展。 作用域注册表允许组件的用户在给定的 shadow root 作用域中选择自定义元素的标记名称。 一旦浏览器开始提供该功能，为每个组件发布两个模块将变得切实可行：一个导出没有副作用的自定义元素类，另一个使用标签名称全局注册它。

在此之前，我们建议继续在全局注册表中注册元素。

### 导出元素类

为了支持子类化，需要从定义元素类的模块中导出它。 这允许在子类化中用于扩展，以及将来可以在 [自定义元素作用域注册表](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Scoped-Custom-Element-Registries.md) 中注册它。

## 更多

有关创建高质量可重用 Web 组件的更通用指南，请参阅 [Web 组件黄金标准清单](https://github.com/webcomponents/gold-standard/wiki)。
