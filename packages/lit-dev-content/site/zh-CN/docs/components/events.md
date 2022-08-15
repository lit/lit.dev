---
title: 事件
eleventyNavigation:
  key: 事件
  parent: 组件
  order: 7
versionLinks:
  v1: components/events/
---

事件是元素传达变化的标准方式。这些变化通常是由于用户交互而发生的。例如，当用户点击一个按钮时，它会分发一个 click 事件；当用户输入值时会分发一个 change 事件。

除了这些自动分发的标准事件之外，Lit 元素还可以分发自定义事件。例如，菜单元素可能会分发一个事件来表示所选项目已更改；当弹出窗口打开或关闭时，弹出元素也可能会分发一个事件。

任何 Javascript 代码，包括 Lit 元素本身，都可以监听事件并根据事件采取行动。例如，工具栏元素可能会在选择菜单项时过滤列表；登录元素在登录按钮的被点击时可能会处理登录相关事物。

## 事件监听 { #listening-to-events }

除了标准的 `addEventListener` API 之外，Lit 还引入了一种声明式添加事件监听器的方式。

### 在模板中添加事件监听器 {#adding-event-listeners-in-the-element-template}

你可以在模板中使用 `@` 表达式将事件监听器添加到组件模板中的元素。渲染模板时添加声明式事件监听器。

{% playground-example "docs/components/events/child/" "my-element.ts" %}

#### 自定义事件监听选项 {#event-options-decorator}

如果你需要自定义用于声明式事件监听器的事件选项（如 `passive` 或 `capture`），可以使用 `@eventOptions` 装饰器在监听器上指定这些选项。传给 `@eventOptions` 的对象将作为 `options` 参数传给 `addEventListener`。

```js
import {LitElement, html} from 'lit';
import {eventOptions} from 'lit/decorators.js';
//...
@eventOptions({passive: true})
private _handleTouchStart(e) { console.log(e.type) }
```

<div class="alert alert-info">

**使用装饰器。** 装饰器是一项提案中的 JavaScript 功能，因此你需要使用 Babel 或 TypeScript 之类的编译器来使用装饰器。请参阅 [启用装饰器]({{baseurl}}/docs/components/decorators/#enabling-decorators)了解更多详细信息。

</div>

### 向组件或其 shadow root 上添加事件监听器 {#adding-event-listeners-to-the-component-or-its-shadow-root}

可以使用标准的 `addEventListener` DOM 方法向组件本身添加一个监听器，就可以监听来自组件插槽中的子元素以及通过组件模板渲染到 shadow DOM 中的子元素分发的事件。有关完整详细信息，请参阅 MDN 上的 [EventTarget.addEventListener()](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)。

组件构造函数是在组件上添加事件监听器的好地方。

```js
constructor() {
  super();
  this.addEventListener('click', (e) => console.log(e.type, e.target.localName)));
}
```

向组件本身添加事件监听器是一种事件委托形式，委托可以减少代码或提高性能。请参阅 [事件委托](#event-delegation) 了解有关详细信息。通常，在事件委托中，事件的 `target` 属性用于判断是在哪个元素触发了事件并据此来采取对应措施。

但是，当组件上的事件监听器监听到它的 shadow DOM 触发的事件时会被重定向。这意味着事件的 tartget 是组件本身。请参阅 [使用shadow DOM 中的事件](#shadowdom)了解有关详细信息。

重定向可能会干扰事件委托，为了避免这种情况，可以将事件监听器添加到组件的 shadow root 本身。由于 `constructor` 中不可以访问`shadowRoot`，因此可以在 `createRenderRoot` 方法中添加事件监听器，如下所示。注意，请确保从 `createRenderRoot` 方法返回 shadow root。

{% playground-example "docs/components/events/host/" "my-element.ts" %}

### 添加事件监听器到其他元素上 {#adding-event-listeners-to-other-elements}

如果你的组件将事件监听器添加到除了它自己和它的模板 DOM 之外的任何东西上——例如：`Window`、`Document` 或主 DOM 树中的某些元素——你应该在 `connectedCallback` 中添加监听器并在 `disconnectedCallback` 中移除监听。

* 在 `disconnectedCallback` 中移除事件监听器可确保当组件被销毁或与页面断开连接时，组件分配的任何内存都将被清理。

* 在 `connectedCallback` 中添加事件监听器（而不是构造函数或 `firstUpdated`）可确保组件在断开连接并随后重新连接到 DOM 时重新创建其事件监听器。

```js
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
}
disconnectedCallback() {
  window.removeEventListener('resize', this._handleResize);
  super.disconnectedCallback();
}
```

有关 `connectedCallback` 和 `disconnectedCallback` 的更多信息，请参阅MDN上使用自定义元素 [生命周期回调](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements) 的文档。

### 性能优化 { #optimizing-for-performance }

添加事件侦听器的速度非常快，而且通常不需要考虑性能问题。但是，对于使用频率高且需要大量事件监听器的组件，可以通过[事件委托](#event-delegation)来减少使用监听器的数量和在渲染后 [异步](#async-events）添加监听器来优化首次渲染性能。

#### 事件代理 { #event-delegation }

使用事件委托可以减少事件监听器的数量，从而提高性能。同时，也可以很方便地通过集中事件处理减少代码。事件委托只能用于处理 `冒泡` 事件。有关冒泡的详细信息，请参阅 [分发事件](#dispatching-events)。

可以在 DOM 的任何祖先元素上监听到冒泡事件。可以利用这一点，在祖先组件上添加单个事件监听器，这样就可以在 DOM 中其任何后代分发冒泡事件时收到通知。通过事件的 `target` 属性获取分发事​​件的元素，根据不同元素执行特定操作。

{% playground-example "docs/components/events/delegation/" "my-element.ts" %}

#### 异步添加事件监听器 { #async-events }

要在渲染后再添加事件监听器，请使用 `firstUpdated` 方法。这是一个 Lit 生命周期回调，它在组件首次更新并渲染其模板 DOM 后运行。

`firstUpdated` 回调在组件第一次被更新并调用它的 `render` 方法后且浏览器有机会绘制 **之前** 触发。

请参阅生命周期文档中的 [firstUpdated]({{baseurl}}/docs/components/lifecycle/#firstupdated) 了解更多信息。

如果想要在用户看见组件之后再添加事件监听器，你可以在添加事件之前等待一个在浏览器绘制之后才 resolve 的 promise。

```js
async firstUpdated() {
  // 给浏览器一个绘制的机会
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

### 理解事件监听器中的 `this` { #understanding-this-in-event-listeners }

在模板中使用声明式 `@` 语法添加的事件监听器会自动绑定到组件。

因此，可以使用 `this` 在任何声明式事件处理程序中引用组件的实例：

```js
class MyElement extends LitElement {
  render() {
    return html`<button @click="${this._handleClick}">click</button>`;
  }
  _handleClick(e) {
    console.log(this.prop);
  }
}
```

当必须使用 `addEventListener` 添加监听器时，需要使用箭头函数，以便 `this` 指向当前组件：

```ts
export class MyElement extends LitElement {
  private _handleResize = () => {
    // `this` 指向当前组件
    console.log(this.isConnected);
  }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

请参阅MDN上的 [`this` 的文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)了解更多详细信息。

### 监听重复模板中触发的事件 { #listening-to-events-fired-from-repeated-templates }

在监听重复项的事件时，如果事件冒泡，通常使用 [事件委托](#event-delegation) 会很方便。当事件没有冒泡时，可以在重复的元素上添加监听器。以下是两种方法的示例：

{% playground-example "docs/components/events/list/" "my-element.ts" %}

## 分发事件 { #dispatching-events }

所有 DOM 节点都可以使用 `dispatchEvent` 方法分发事件。首先，创建一个事件实例，指定事件类型和选项。然后将其传给 `dispatchEvent`，如下所示：

```js
const event = new Event('my-event', {bubbles: true, composed: true});
myElement.dispatchEvent(event);
```

选项 `bubbles` 允许事件沿着 DOM 树向上流动到分发事件元素的祖先。如果希望事件能够参与 [事件委托](#event-delegation)，则设置该标志很重要。

选项 `composed` 对于设置允许事件在元素所在的 shadow DOM 树之上分发很有用。

请参阅 [使用 shadow DOM 中的事件](#shadowdom) 了解更多信息。

请参阅 MDN 上的 [EventTarget.dispatchEvent()](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/dispatchEvent)了解有关分发事件的完整描述。

### 什么时候分发事件 { #when-to-dispatch-an-event }

应该分发事件来响应用户交互或组件状态的异步更改。组件所有者通过其 attribute 或 property API 所做的状态更改则**不**应该分发事件。这通常是原生 Web 平台元素的工作方式。

例如，当用户在 `input` 元素中键入值时，会分发 `change` 事件，但如果代码设置了 `input` 的 `value` 属性，则 `change` 事件**不会**被分发.

类似地，菜单组件应该在用户选择菜单项时分发一个事件，但如果设置了菜单的 `selectedItem` 属性，则它不应该分发事件。

这通常意味着组件应该分发一个事件以响应它正在监听的另一个事件。

{% playground-ide "docs/components/events/dispatch/" "my-dispatcher.ts" %}

### 在元素更新后分发事件 { #dispatching-events-after-an-element-updates }

通常，只有在元素更新和渲染之后才应该触发事件。如果事件的目的是传达因用户交互而导致的渲染状态的变化，这可能是必要的。在这种情况下，可以在更改组件的状态之后等待其 `updateComplete` promise。更改状态之后，应该等待 `updateComplete` promise 被 resolve 之后再分发事件。

{% playground-ide "docs/components/events/update/" "my-dispatcher.ts" %}

### 使用标准或自定义事件 { #standard-custom-events }

可以通过构造 `Event` 或 `CustomEvent` 来分发事件，两者皆可。使用 `CustomEvent` 时，任何事件数据都会在事件的 `detail` 属性中传递。使用 `Event` 时，可以创建事件子类并附加自定义 API。

请参阅 MDN 上的 [Event](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/Event) 了解有关构造事件的详细信息。

#### 触发自定义事件:

```js
const event = new CustomEvent('my-event', {
  detail: {
    message: 'Something important happened'
  }
});
this.dispatchEvent(event);
```

请参阅 [关于自定义事件的 MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent)了解更多信息。

#### 触发标准事件:

```js
class MyEvent extends Event {
  constructor(message) {
    super();
    this.type = 'my-event';
    this.message = message;
  }
}

const event = new MyEvent('Something important happened');
this.dispatchEvent(event);
```

## 使用 shadow DOM 中的事件 {#shadowdom}

需要弄清楚一件很重要的事情，就是当使用 shadow DOM 时，它的事件系统与标准事件系统有一些细微差异。shadow DOM 的存在主要是为了在 DOM 中提供一种作用域机制去封装 “shadow” 元素的细节。因此，对外部 DOM 元素来说，shadow DOM 中的事件封装了的某些细节。

### 理解组合事件分发 {#shadowdom-composed}

默认情况下，在 shadow root 内部分发的事件对外部是不可见的。如果想要使事件穿过 shadow DOM 边界，你必须将 [`composed` 属性](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composed) 设置为 `true`。`composed` 与 `bubbles` 搭配使用是很常见的用法，这样 DOM 树中的所有节点都可以看到该事件：

```js
_dispatchMyEvent() {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true 
  });
  this.dispatchEvent(myEvent);
}
```

如果一个事件的 `composed` 和 `bubble` 都是 true，那么它可以被分发事件的元素的所有祖先接收——包括 shadow root 外部的祖先元素。如果一个事件是 `composed` 为 true 但 `bubble` 为 false，那么它只能被分发事件的元素和包含 shadow root 的宿主元素接收。

请注意，大多数标准用户界面事件，包括所有鼠标、触摸和键盘事件，`composed` 和 `bubble` 都是 true。有关详细信息，请参阅 [MDN 关于 composed 事件的文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composed)。

### 了解事件重定向 {#shadowdom-retargeting}

从 shadow root 中分发的 [Composed](#shadowdom-composed) 事件会被重定向，这意味着对于 shadow root 的宿主元素或其祖先元素上的任何监听器来说，监听到的事件似乎均来自宿主元素。由于 Lit 组件会被渲染到 shadow root 中，因此从 Lit 组件内部分发的所有 composed 事件似乎都是由 Lit 组件本身分发的。事件的 `target` 属性总是 Lit 组件。

```html
<my-element onClick="(e) => console.log(e.target)"></my-element>
```

```js
render() {
  return html`
    <button id="mybutton" @click="${(e) => console.log(e.target)}">
      click me
    </button>`;
}
```

在需要确定事件来源的高级场景下，请使用 `event.composedPath()` API。该方法返回事件分发遍历的所有节点的数组，包括 shadow root 中的节点。因为这会破坏封装，所以应注意避免依赖可能暴露的实现细节。常见场景包括确定单击的元素是否是锚点标签，用于客户端路由。

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```

请参阅 [MDN 上有关 composedPath 的文档](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)了解更多信息。

## 事件分发器和监听器之间的通信 { #communicating-between-the-event-dispatcher-and-listener }

事件的存在主要是为了将更改从事件分发器传递到事件监听器，但事件也可用于将信息从监听器传递回分发器。

可以做到这一点的一种方法是在事件上公开 API，监听器可以使用这些 API 来自定义组件行为。例如，监听器可以在自定义事件的 detail 属性上设置一个属性，然后分发事件的组件使用该属性来自定义行为。

在分发器和监听器之间进行通信的另一种方式是通过 `preventDefault()` 方法。可以调用它来指示不应触发事件的标准行为。当监听器调用 `preventDefault()` 时，事件的 `defaultPrevented` 属性变为 true。然后监听器可以使用此标志来自定义行为。

以下示例中使用了这两种技术：

{% playground-ide "docs/components/events/comm/" "my-listener.ts" %}
