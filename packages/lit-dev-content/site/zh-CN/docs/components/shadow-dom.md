---
title: 使用Shadow DOM
eleventyNavigation:
  key: Shadow DOM
  parent: Components
  order: 6
versionLinks:
  v1: components/templates/#accessing-nodes-in-the-shadow-dom
---

Lit 组件使用 [shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom) 来封装它们的 DOM。 Shadow DOM 提供了一种向元素添加单独隔离和封装的 DOM 树的方法。 DOM 封装是解锁与页面上运行的任何其他代码（包括其他 Web 组件或 Lit 组件）互操作性的关键。

Shadow DOM 提供了三个好处:

* DOM 作用域。像 `document.querySelector` 这样的 DOM API 不会在
  组件的shadow DOM中查找，因此全局脚本更难意外破坏你的组件。
* 样式作用域。你可以为你的shadow DOM 编写封装样式，封装样式不会影响 DOM 树的其他部分。
* 组合。包含其内部 DOM 的组件的shadow root与组件的子项是分开的。你可以选择如何在组件的内部 DOM 中呈现子项。

参阅下列文档了解更多shadow DOM的信息:

* Web Fundamentals上的[Shadow DOM v1: Self-Contained Web Components](https://developers.google.com/web/fundamentals/web-components/shadowdom)。
* MDN上的[使用 shadow DOM](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM)。


<div class="alert alert-info">

**旧版浏览器。** 在原生 shadow DOM 不可用的旧版浏览器上，可以使用 [web components polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)。请注意，Lit 的 `polyfill-support` 模块必须与 web components polyfills 一起加载。请参阅 [旧版浏览器的要求]({{baseurl}}/docs/tools/requirements/#building-for-legacy-browsers)了解更多相关详细信息。

</div>

## 在 shadow DOM 中访问节点 {#accessing-nodes-in-the-shadow-dom}


Lit 将组件渲染到它的 `renderRoot`，默认情况下是一个shadow root。可以使用 DOM 查询 API查找其内部元素，例如 `this.renderRoot.querySelector()`。

`renderRoot` 应该始终是shadow root或元素，它们提供诸如 `.querySelectorAll()` 和 `.children` 之类的 API。

你可以在组件初始渲染后查询内部 DOM（例如，在 `firstUpdated` 中），或使用 getter 模式：

```js
firstUpdated() {
  this.staticNode = this.renderRoot.querySelector('#static-node');
}

get _closeButton() {
  return this.renderRoot.querySelector('#close-button');
}
```

LitElement 提供了一组装饰器，它们提供了一种定义 getter 的简写方式。

### @query, @queryAll, 和 @queryAsync 装饰器 {#@query-@queryAll-@queryAsync}

`@query`、`@queryAll` 和 `@queryAsync` 装饰器都提供了一种便捷的方式来访问内部组件 DOM 中的节点。

<div class="alert alert-info">

**使用装饰器。** 装饰器是一项提案中的 JavaScript 功能，因此你需要使用 Babel 或 TypeScript 之类的编译器来使用装饰器。请参阅 [使用装饰器]({{baseurl}}/docs/components/decorators/)了解详细信息，。

</div>

#### @query { #query }

修改类属性，将其转换为从render root返回节点的 getter。可选的第二个参数为 true 时只执行一次 DOM 查询并缓存结果。在被查询的节点不会改变的情况下，缓存可以用作性能优化。

```js
import {LitElement, html} from 'lit';
import {query} from 'lit/decorators/query.js';

class MyElement extends LitElement {
  @query('#first')
  _first;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

`@query` 装饰器相当于：

```js
get _first() {
  return this.renderRoot?.querySelector('#first') ?? null;
}
```

#### @queryAll { #query-all }

与 `query` 相同，只是它返回所有匹配的节点，而不是单个节点。相当于调用 `querySelectorAll`。

```js
import {LitElement, html} from 'lit';
import {queryAll} from 'lit/decorators/queryAll.js';

class MyElement extends LitElement {
  @queryAll('div')
  _divs;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

在这里，`_divs` 将返回模板中的两个 `<div>` 元素。对于 TypeScript，`@queryAll` 属性的类型是 `NodeListOf<HTMLElement>`。如果确切知道要检索的节点类型，则可以写得更具体：

```js
@queryAll('button')
_buttons!: NodeListOf<HTMLButtonElement>
```

`buttons` 后面的感叹号 (`!`) 是 TypeScript 的 [非空断言运算符](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0。html#non-空断言运算符)。它告诉编译器将 `buttons` 视为始终被定义，而不是 `null` 或 `undefined`。

#### @queryAsync { #query-async }

类似于`@query`，不过它不是直接返回一个节点，而是返回一个`Promise`，promise 在任何挂起的元素渲染完成后查询到并resolve该节点。编写代码时可以使用 `@queryAsync`，而不是等待 `updateComplete` promise被resolve之后再去同步查询节点。

这很有用，例如，如果 `@queryAsync` 返回的节点可能由于另一个属性更改而发生更改。

## 通过插槽渲染子元素 {#slots}

组件可以接受子元素（就像 `<ul>` 可以包含 `<li>` 子元素）。

```html
<my-element>
  <p>A child</p>
</my-element>
```
默认情况下，如果一个元素有shadow树，它的子元素就不会被渲染。

要渲染子元素，你的模板需要包含一个或多个 [`<slot>` 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)，它们将充当子元素的占位符。

### 使用插槽元素 {#using-the-slot-element}

要渲染组件的子元素，请在组件的模板中为它们创建一个 `<slot>`。子节点在 DOM 树中没有被 _移动_，但它们被渲染成看起来就 _好像_ 它们是`<slot>`的子节点一样。例如：

{% playground-ide "docs/components/shadowdom/slots/" %}

### 使用具名插槽 {#using-named-slots}

要将子元素分配给特定插槽，请确保子元素的 `slot` 属性与插槽的 `name` 属性相匹配：

* **具名插槽仅接受具有匹配 `slot` 属性的子元素。**

  例如，`<slot name="one"></slot>` 只接受具有属性 `slot="one"` 的子元素。

* **具有 `slot` 属性的子元素只会被渲染到具有匹配 `name` 属性的插槽中。**

  例如，`<p slot="one">...</p>` 只会被放置到 `<slot name="one"></slot>` 中。

{% playground-ide "docs/components/shadowdom/namedslots/" %}

### 指定插槽回退内容 {#specifying-slot-fallback-content}

You can specify fallback content for a slot. The fallback content is shown when no child is assigned to the slot.
你可以为插槽指定回退内容。当没有子元素分配给插槽时，将显示回退内容。

```html
<slot>I am fallback content</slot>
```

<div class="alert alert-info">

**渲染回退内容。** 如果将任何子元素分配给插槽，则不会渲染其回退内容。不具名的默认插槽可以接受任何子元素。即使唯一分配的元素是包含空格的文本元素，它也不会渲染回退内容，例如 `<example-element> </example-element>`。

</div>

## 访问插槽中的被插入的子节点 { #accessing-slotted-children }

可以使用标准的 `slot.assignedNodes` 或 `slot.assignedElements` 方法和 `slotchange` 事件，来访问分配给shadow root中插槽的子节点。

例如，你可以创建一个 getter 来访问特定插槽的分配元素：

```js
get _slottedChildren() {
  const slot = this.shadowRoot.querySelector('slot');
  return slot.assignedElements({flatten: true});
}
```

你还可以使用 `slotchange` 事件在分配的节点更改时采取行动。
以下示例提取所有插槽子节点的文本内容。

```js
handleSlotchange(e) {
  const childNodes = e.target.assignedNodes({flatten: true});
  // ... 做一些与子节点相关的事情 ...
  this.allText = childNodes.map((node) => {
    return node.textContent ? node.textContent : ''
  }).join('');
}

render() {
  return html`<slot @slotchange=${this.handleSlotchange}></slot>`;
}
```

请参阅MDN上的[HTMLSlotElement](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLSlotElement)了解更多信息。

### @queryAssignedElements 和 @queryAssignedNodes 装饰器 { #query-assigned-nodes }

`@queryAssignedElements` 和 `@queryAssignedNodes` 将类属性转换为getter，getter返回的结果分别是调用
[`slot.assignedElements`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements) 或 [`slot.assignedNodes`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedNodes) 返回的在组件插槽内部的元素或节点。

使用这些装饰器来查询分配给插槽的元素或节点。

这两个装饰器都可以接受一个包含下列属性的对象作为参数：

| 属性       | 描述                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `flatten` | Boolean specifying whether to flatten the assigned nodes by replacing any child `<slot>` elements with their assigned nodes. |
| `slot` | 指定要查询的插槽的插槽名称。不指定则选择默认插槽。|
| `selector` (只对 `queryAssignedElements` 生效) | 如果指定，则仅返回与此 CSS 选择器匹配的已分配元素。 |

使用哪个装饰器取决于你要查询的节点包含文本节点，还是只查询元素节点。你应该根据你的实际场景做决定。

<div class="alert alert-info">

**使用装饰器。** 装饰器是一项提案中的 JavaScript 功能，因此你需要使用 Babel 或 TypeScript 之类的编译器来使用装饰器。请参阅 [使用装饰器]({{baseurl}}/docs/components/decorators/)了解更多详细信息。

</div>

```ts
@queryAssignedElements({slot: 'list', selector: '.item'})
_listItems!: Array<HTMLElement>;

@queryAssignedNodes({slot: 'header', flatten: true})
_headerNodes!: Array<Node>;
```

上面的示例相当于下面的代码：

```js
get _listItems() {
  const slot = this.shadowRoot.querySelector('slot[name=list]');
  return slot.assignedElements().filter((node) => node.matches('.item'));
}

get _headerNodes() {
  const slot = this.shadowRoot.querySelector('slot[name=header]');
  return slot.assignedNodes({flatten: true});
}
```

## 自定义 render root {#renderroot}

每个 Lit 组件都有一个**render root**——是一个 DOM 节点，用作其内部 DOM 的容器。

默认情况下，LitElement 创建一个开放的 `shadowRoot` 并在其中渲染，生成以下 DOM 结构：

```html
<my-element>
  #shadow-root
    <p>child 1</p>
    <p>child 2</p>
```

LitElement有两种自定义render root的方式：

* 设置 `shadowRootOptions`。
* 实现 `createRenderRoot` 方法。

### 设置 `shadowRootOptions`

自定义render root最简单的方法是设置 `shadowRootOptions` 静态属性。在创建组件的shadow root时，`createRenderRoot` 的默认实现是将 `shadowRootOptions` 作为选项参数传递给 `attachShadow`。它可以设置为自定义 [ShadowRootInit](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/attachShadow) 字典中允许的任何选项，例如 `mode` 和 `delegatesFocus`。

```js
class DelegatesFocus extends LitElement {
  static shadowRootOptions = {...LitElement.shadowRootOptions, delegatesFocus: true};
}
```

请参阅MDN上的 [Element.attachShadow()](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/attachShadow)了解更多详细信息。

### 实现 `createRenderRoot` {#implementing-createrenderroot}

`createRenderRoot` 的默认实现会创建一个开放的shadow root，并向其添加 `static styles` 类字段中设置的任何样式。请参阅 [样式]({{baseurl}}/docs/components/styles/)了解有关样式的更多信息。

要自定义组件的render root，请实现 `createRenderRoot` 并返回你希望模板渲染到的节点。

例如，要将模板作为元素的子元素渲染到主 DOM 树中，请实现 `createRenderRoot` 并返回 `this`。

<div class="alert alert-info">

**渲染到子级。** 通常不建议渲染到子级而不是shadow DOM。否则你的元素将无法访问 DOM 或样式作用域，并且无法将元素组合到其内部 DOM 中。

</div>

{% playground-ide "docs/components/shadowdom/renderroot/" %}
