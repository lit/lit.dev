---
title: 升级指南
eleventyNavigation:
  key: 升级指南
  parent: 发版
  order: 3
---

## 概览

Lit 2.0 旨在处理为 LitElement 2.x 和 lit-html 1.x 编写的大多数代码。 将代码迁移到 Lit 2.0 需要进行少量更改。 所需的高级更改包括：

1. 更新npm包和导入路径。
1. 加载 web 组件 polyfill 的同时加载 `polyfill-support` 脚本。
1. 使用新的基于类的 API 更新所有的自定义指令实现和相关的帮助程序。
1. 将代码更新为重命名后的 API。
1. 适配次要的重大变化，主要是在不常见的情况下。

以下部分将详细介绍这些更改。

## 更新包和导入路径

### 使用`lit`包

Lit 2.0 附带了一个一站式的 `lit` 包，它将 `lit-html` 和 `lit-element` 合并到一个易于使用的包中。 使用以下命令进行升级：

```sh
npm uninstall lit-element lit-html
npm install lit
```

然后适当地重写模块的导入：

从：
```js
import {LitElement, html} from 'lit-element';
```
修改为：
```js
import {LitElement, html} from 'lit';
```

尽管 `lit-element@^3` 和 `lit-html@^2` 包应该在很大程度上向后兼容，但我们建议更新到 `lit` 包，因为其他包最终都会被弃用。

### 更新装饰器导入

之前版本的 `lit-element` 从主模块中导出了所有的 TypeScript 装饰器。 在 Lit 2.0 中，他们都被移动到一个单独的模块中，以便在未使用装饰器时获得更小的包大小。

从：
```js
import {property, customElement} from 'lit-element';
```
修改为：
```js
import {property, customElement} from 'lit/decorators.js';
```

### 更新指令导入
内置的 lit-html 指令现在也从 `lit` 包中导出。

从:
```js
import {repeat} from 'lit-html/directives/repeat.js';
```
修改为:
```js
import {repeat} from 'lit/directives/repeat.js';
```

### 更新独立的 lit-html 导入

如果（在 LitElement 之外）独立使用 lit-html，你可以从 `lit/html.js` 入口点导入特定的独立 API，例如 `render`：

从:
```js
import {render, html} from 'lit-html';
```
修改为:
```js
import {render, html} from 'lit/html.js';
```

## 在使用 web 组件 polyfills 时加载 `polyfill-support`

Lit 2.0 仍然支持低至类似 IE11 的浏览器。 然而，鉴于 Web 组件 API 在现代浏览器中的广泛采用，我们借此机会将与 Web 组件 polyfill 交互所需的所有代码从核心库中移出并放入一个可选的支持文件中，以便只在需要支持旧浏览器的时候引入。

一般来说，任何时候只要你使用 web 组件的 polyfill，你也应该在页面上加载一次 `lit/polyfill-support.js` 支持文件，类似于 polyfill。 例如：

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js">
<script src="node_modules/lit/polyfill-support.js">
```

如果你使用 [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) 或 [`@web/dev-server`](https://modern- web.dev/docs/dev-server/overview/) 与 [`legacyPlugin`](https://modern-web.dev/docs/dev-server/plugins/legacy/) 进行开发，请将以下配置添加到你的 `web-test-runner.config.js` 或 `web-dev-server.config.js` 文件，将其配置为在需要时自动注入支持文件：

```js
export default {
  ...
  plugins: [
    legacyPlugin({
      polyfills: {
        webcomponents: true,
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

## 更新被重命名的 API

以下高级 API 已在 Lit 2.0 中已经被重命名。 如果有使用到的话，在你的代码库中简单地重命名它们应该是安全的：

| 原名称 | 新名称 | 笔记 |
| ------------- | -------- | ----- |
| `UpdatingElement` | `ReactiveElement` |  支撑 `LitElement`的基类。 现在采用与我们用来描述其响应式生命周期的术语保持一致的命名。  |
| `@internalProperty` | `@state` |`LitElement` / `ReactiveElement` 用于表示触发更新的私有状态的装饰器，而不是用户使用 `@property` 装饰器可设置的元素上的公共属性。|
| `static getStyles()` | `static finalizeStyles(styles)` | `LitElement` 和 `ReactiveElement` 类用于处理覆盖样式的方法。 请注意，它现在还需要一个表示类的静态样式的参数。|
| `_getUpdateComplete()` | `getUpdateComplete()` |  `LitElement` 和 `ReactiveElement` 类上用于覆盖 `updateComplete` promise 的方法。 |
| `NodePart` | `ChildPart` | 通常只在指令代码中使用； 见下文。

## 更新自定义指令实现
虽然 _使用_ 指令的 API 应该 100% 向后兼容 1.x，但自定义指令的 _编写_ 方式发生了重大变化。 API 更改改进了围绕制定有状态指令的人机工程学，同时为 SSR 兼容指令提供了清晰的模式：服务器上只会调用“render”，而不会调用“update”。


### 指令 API 更改概述

| 概念 | 原 API | 新 API |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Code&nbsp;idiom** | 接受指令参数的函数，并返回接受 `part` 并返回值的函数 | 继承自 `Directive` 的类，该类包含接收指令参数的 `update` 和 `render` 方法 |
| **声明式渲染** | 将值传递给 `part.setValue()` | `render()` 方法的返回值 |
| **DOM&nbsp;操作** | 在指令函数中实现 |在 `update()` 方法中实现 |
| **状态** | 存储在关键字为 `part` 的 `WeakMap` 中 | 存储在类实例字段中 |
| **Part&nbsp;验证** | 在每次渲染中使用 `instanceof` 来检查 `part` | 在构造函数中检查 `part.type` check in constructor |
| **异步更新** | `part.setValue(v);`<br>`part.commit();` | 继承 `AsyncDirective` 而不是 `Directive`，并调用 `this.setValue(v)` |

### 指令迁移示例

下面是一个 lit-html 1.x 指令的示例，以及如何将其迁移到新的 API：

1.x 指令 API：

```js
import {html, directive, Part, NodePart} from 'lit-html';

// 存储在 WeakMap 中的状态
const previousState: WeakMap<Part, number> = new WeakMap();

// 基于函数的指令 API
export const renderCounter = directive((initialValue: number) => (part: Part) => {
  // 必要时，在每个渲染中使用 `instanceof` 验证 part 类型
  if (!(part instanceof NodePart)) {
    throw new Error('renderCounter only supports NodePart');
  }
  // 取回之前状态的值
  let value = previousState.get(part);
  // 更新状态
  if (value === undefined) {
    value = initialValue;
  } else {
    value++;
  }
  // 存储状态
  previousState.set(part, value);
  // 使用新的渲染更新 part
  part.setValue(html`<p>${value}</p>`);
});
```

2.0 指令 API：

```js
import {html} from 'lit';
import {directive, Directive, Part, PartInfo, PartType} from 'lit/directive.js';

// 基于类的指令 API
export class RenderCounter extends Directive {
  // 状态存储在类字段中
  value: number | undefined;
  constructor(partInfo: PartInfo) {
    super(partInfo);
    // 必要时，在构造函数中使用 `part.type` 验证 part
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('renderCounter only supports child expressions');
    }
  }
  // 可选：覆盖 update 来执行任何直接对 DOM 的操作
  update(part: Part, [initialValue]: DirectiveParameters<this>) {
    /* 任何对 DOM/parts 的命令式更新都会放在这里 */
    return this.render(initialValue);
  }
  // 进行服务端兼容的渲染（参数从调用站点传入）
  render(initialValue: number) {
    // 类字段上的上一个可用的状态
    if (this.value === undefined) {
      this.value = initialValue;
    } else {
      this.value++;
    }
    return html`<p>${this.value}</p>`;
  }
}
export const renderCounter = directive(RenderCounter);
```

## 适配次要的重大变化

为完整起见，以下列出了你可能需要调整代码以适配的次要但值得注意的重大更改。 我们预计这些变化会影响相对较少的用户。

### `LitElement`
* 为简单起见，`requestUpdate` 不再返回 Promise。而是 await `updateComplete` promise。
* 在更新周期中发生的错误会被压制，以便允许后续更新正常进行。现在错误会异步重新触发，以便可以检测到它们。可以通过 window.unhandledrejection 事件处理程序观察错误。
* 通过 `createRenderRoot` 创建 `shadowRoot` 和对 `shadowRoot` 应用 `static 样式` 的支持已从 `LitElement` 移至`ReactiveElement`。
* `createRenderRoot` 方法现在在第一次更新之前调用，而不是在构造函数中。元素代码不能假设 `renderRoot` 存在于元素 `hasUpdated` 之前。进行此更改是为了与服务器端呈现兼容。
* `ReactiveElement` 的 `initialize` 方法已被移除。这项工作现在在元素的构造函数中完成。
* `LitElement` 基类的 _静态_ `render` 方法已被移除。这主要用于实现 ShadyDOM 集成，而不是作为用户可覆盖的方法。 ShadyDOM 集成现在通过 `polyfill-support` 模块实现。
* 当 property 声明是 `reflect: true` 并且它的 `toAttribute` 函数返回 `undefined` 时，attribute 现在被删除，之前它保持不变（([#872](https://github.com/Polymer/lit-element/issues/872))。
* `attributeChangedCallback` 中的脏检查已被删除。虽然在技术上是突破性的，但在实践中它应该是很少的 ([#699](https://github.com/Polymer/lit-element/issues/699))。
* LitElement 的 `adoptStyles` 方法已被移除。样式现在在 `createRenderRoot` 中被应用。可以重写此方法以自定义此行为。
* 删除了`requestUpdateInternal`。 `requestUpdate` 方法现在与该方法相同，应该使用 `requestUpdate` 替代。

### `lit-html`
* `render()` 不再清除它在第一次渲染时渲染到的容器。它现在默认添加到容器中。
* 注释中的表达不会渲染或更新。
* Template caching happens per call site, not per template-tag/call-site pair. This means some rare forms of highly dynamic template tags are no longer supported.
* 传递给 attribute bindings 的数组和其他可迭代对象不再被特殊处理。数组将以其默认的 toString 表示形式渲染。这意味着 ``html`<div class=${['a', 'b']}> `` 将被渲染为 `<div class="a,b">` 而不是 `<div class="ab" >`。要获得旧行为，请使用 `array.join(' ')`。
* `RenderOptions` 的 `templateFactory` 选项已被移除。
* `TemplateProcessor` 已被移除。
* Symbols 在修改 DOM 之前不会转换为字符串，因此将 Symbols 传递给 attribute 或 text binding 将导致异常。
* attribute 表达式中的 `ifDefined` 指令现在删除了 `null` 和 `undefined` 的属性，而不仅仅是 `undefined`。
* 将值 `nothing` 呈现给 attribure 表达式会导致 attribute 被删除——即使在属性值位置有多个表达式并且只有一个是 `nothing`。例如，给定 `src="${baseurl}/${filename}"`，如果 _无论_ `baseurl` 或 `filename` 评估为 `nothing`，那么都会删除 `src` 属性。
* 在 `unsafeHTML` 或 `unsafeSVG` 指令中渲染值 `nothing`、`null` 或 `undefined` 现在将导致不渲染任何内容（之前它会渲染 `'[object Object]'`、`' null'` 或 `'undefined'`）。
