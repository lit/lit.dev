---
title: 独立使用 lit-html
eleventyNavigation:
  key: 独立使用 lit-html
  parent: 相关库
  order: 1
---

Lit 将 LitElement 的组件模型与基于 JavaScript 模板字符串的渲染结合到一个易于使用的包中。 但是，Lit 的模板部分被分解为一个名为 `lit-html` 的独立库，它可以在 Lit 组件模型之外的任何需要高效地渲染和更新 HTML 的地方使用。

## lit-html 独立包

`lit-html` 包可以与 `lit` 分开安装：

```sh
npm install lit-html
```

主要的导入有 `html` 和 `render`：

```js
import {html, render} from 'lit-html';
```

独立的 `lit-html` 包还包括完整的 `Lit` 开发指南中描述的以下功能的模块：

* `lit-html/directives/*` - [内置指令]({{baseurl}}/docs/templates/directives/)
* `lit-html/directive.js` - [自定义指令]({{baseurl}}/docs/templates/custom-directives/)
* `lit-html/async-directive.js` - [自定义异步指令]({{baseurl}}/docs/templates/custom-directives/#async-directives)
* `lit-html/directive-helpers.js` - [用于命令式更新的指令助手]({{baseurl}}/docs/templates/custom-directives/#imperative-dom-access:-update())
* `lit-html/static.js` - [静态 html 标签]({{baseurl}}/docs/templates/expressions/#static-expressions)
* `lit-html/polyfill-support.js` - 与 web 组件 polyfill 交互的支持（参见 [样式和 lit-html 模板](#styles-and-lit-html-templates)）

## 渲染 lit-html 模板

Lit 模板是使用带有 `html` 标签的 JavaScript 模板字符串编写的。 字符串的内容大多是简单的、声明式的 HTML，并且可能包含一些用于插入和更新模板的动态部分的表达式（请参阅 [模板]({{baseurl}}/docs/templates/overview/) 以获取有关 Lit 模板语法的完整参考）。

```html
html`<h1>Hello ${name}</h1>`
```

lit-html 模板表达式不会造成任何 DOM 的创建或更新。 它只是对 DOM 的描述，称为 `TemplateResult`。 要实际创建或更新 DOM，你需要将 `TemplateResult` 传递给 `render()` 函数，以及要渲染到的容器：

```js
import {html, render} from 'lit-html';

const name = 'world';
const sayHi = html`<h1>Hello ${name}</h1>`;
render(sayHi, document.body);
```

## 渲染动态数据

To make your template dynamic, you can create a _template function_. Call the template function any time your data changes.
要使你的模板动态化，您可以创建一个 _模板函数_。 每当数据更改时调用模板函数。

```js
import {html, render} from 'lit-html';

// 定义模板函数
const myTemplate = (name) => html`<div>Hello ${name}</div>`;

// 使用一些数据渲染模板
render(myTemplate('earth'), document.body);

// ... 稍后 ...
// 使用不同的数据渲染模板
render(myTemplate('mars'), document.body);
```

当你调用模板函数时，lit-html 会捕获当前表达式值。 模板函数不会创建任何 DOM 节点，因此它既快速开销又低。

模板函数返回一个包含模板和输入数据的 `TemplateResult`。 这是使用 lit-html 背后的主要原则之一：**将 UI 创建为一个状态_函数_**。

当你调用 `render` 时，**lit-html 仅更新自上次渲染以来已更改的模板部分。** 这使得 lit-html 更新非常快。

### 渲染选项

`render` 方法还接受一个 `options` 参数，允许你指定以下选项：

* `host`：调用通过 `@eventName` 语法注册的事件侦监听器时使用的 `this` 值。 该选项仅在你将事件监听器指定为普通函数时适用。 如果你使用事件监听器对象作为事件监听器，则监听器对象被用作 `this` 值。 有关事件监听器的更多信息，请参阅 [事件侦听器表达式]({{baseurl}}/docs/templates/expressions/#event-listener-expressions)。

* `renderBefore`：`container` 中的一个可选引用节点，lit-html 会被渲染到该节点之前。 默认情况下， lit-html 将被追加到容器的末尾。 设置 `renderBefore` 允许渲染到容器内的特定位置。

* `creationScope`：一个对象（默认为 `document`），lit-html 在克隆模板时会调用其 `importNode` 方法。 这是为高级场景提供的。

For example, if you're using `lit-html` standalone, you might use render options like this:

例如，如果你独立使用 `lit-html`，你可以使用如下渲染选项：

```html
<div id="container">
  <header>My Site</header>
  <footer>Copyright 2021</footer>
</div>
```

```ts
const template = () => html`...`;
const container = document.getElementById('container');
const renderBefore = container.querySelector('footer');
render(template(), container, {renderBefore});
```

上面的示例将在 `<header>` 和 `<footer>` 元素之间渲染模板。

<div class="alert alert-info">

**渲染选项必须是常量。** 渲染选项*不*应该在后续的 `render` 调用之间改变。

</div>

## 样式和 lit-html 模板

lit-html 专注于一件事：渲染 HTML。 如何将样式应用到 lit-html 创建的 HTML 取决于你如何使用它——例如，如果你在像 LitElement 这样的组件系统中使用 lit-html，你可以遵循该组件系统使用的模式。

通常，如何设置 HTML 样式取决于你是否使用 shadow DOM：

* 如果不是渲染到 shadow DOM，那么你可以使用全局样式表设置 HTML 样式。
* 如果正在渲染到 shadow DOM，那么你可以在 shadow root 内渲染 `<style>` 标签。

<div class="alert alert-info">

**在旧版浏览器上设置 shadow root 的样式需要 polyfill。** 将 [ShadyCSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss) polyfill 与独立的 `lit-html` 一起使用需要加载 ` lit-html/polyfill-support.js`，并在 `RenderOptions` 中传入一个 `scope` 选项和宿主标签名称，用于限定渲染内容的范围。 尽管这种方法是可行的，但如果你想支持在旧版浏览器上渲染 lit-html 模板到 shadow DOM，我们建议使用 [LitElement]({{baseurl}}/docs/components/overview/)。

</div>

为了帮助实现动态样式，lit-html 提供了两个指令来操作元素的 `class` 和 `style` 属性：

* [`classMap`]({{baseurl}}/docs/templates/directives/#classmap) 根据对象的属性在元素上设置类。
* [`styleMap`]({{baseurl}}/docs/templates/directives/#stylemap) 根据样式属性和值的 map 设置元素的样式。