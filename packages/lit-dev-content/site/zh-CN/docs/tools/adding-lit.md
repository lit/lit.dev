---
title: 将 Lit 添加到现有项目
eleventyNavigation:
  key: 添加 Lit
  parent: 工具
  order: 8
versionLinks:
  v1: tools/use/
---

Lit 不需要任何专门的工具，并且 Lit 组件可以在任何 JavaScript 框架或任何服务端模板系统或 CMS 中工作，因此 Lit 非常适合添加到现有项目和应用程序中。

## 从 npm 安装

首先，从 npm 安装 `lit` 包：

```sh
npm i lit
```

如果你还没有使用 npm 来管理 JavaScript 依赖项，则必须首先设置你的项目。 我们推荐使用 [npm CLI](https://docs.npmjs.com/cli/v7/configuring-npm/install)。

## 添加一个组件

你可以在项目资源中的任何位置创建新元素：

_lib/components/my-element.ts_

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  render() {
    return html`
      <div>Hello from MyElement!</div>
    `;
  }
}
```

```js
import {LitElement, html} from 'lit';

class MyElement extends LitElement {
  render() {
    return html`
      <div>Hello from MyElement!</div>
    `;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

## 使用你的组件

How you use a component depends on your project and the libraries or frameworks it uses. You can use your component in HTML, with DOM APIs, or in template languages:

如何使用组件取决于你的项目以及它使用的库或框架。 你可以在 HTML、DOM API 或模板语言中使用你的组件：

### 纯 HTML
```html
<script type="module" src="/lib/components/my-elements.js">
<my-element></my-element>
```

### JSX

JSX 是一种非常常见的模板语言。 在 JSX 中，小写的元素名称会创建 HTML 元素，这就是 Lit 组件。 使用的是你在 `@customElement()` 装饰器中指定的标签名称：

```tsx
import './components/my-elements.js';

export const App = () => (
  <h1>My App</h1>
  <my-element></my-element>
)
```

### 框架模板

大多数 JavaScript 框架对 [ Web 组件](https://custom-elements-everywhere.com/) 和 Lit 都有强大的支持。 只需导入你的元素定义并在模板中使用元素标签名称即可。

## 下一步

此时，你应该能够构建并运行您的项目并看到 “Hello from MyElement！” 信息。

如果你准备好为组件添加功能，请前往 [组件]({{baseurl}}/docs/components/overview/) 了解如何构建你的第一个 Lit 组件，或 [模板]({{baseurl}}/docs/templates/overview/) 了解有关编写模板的详细信息。

有关构建项目的详细信息，包括一些 Rollup 配置示例，请参阅 [构建生产]({baseurl}}/docs/tools/production/)。
