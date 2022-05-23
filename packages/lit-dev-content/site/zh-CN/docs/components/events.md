---
title: 事件
eleventyNavigation:
  key: 事件
  parent: 组件
  order: 7
versionLinks:
  v1: components/events/
---

事件是元素传达变化的标准方式。这些变化通常是由于用户交互而发生的。例如，当用户点击一个按钮时，它会分发一个 click 事件；当用户在其中输入值时会分发一个 change 事件。

除了这些自动分发的标准事件之外，Lit 元素还可以分发自定义事件。例如，菜单元素可能会分发一个事件来指示所选项目已更改；当弹出窗口打开或关闭时，弹出元素也可能会分发一个事件。

任何 Javascript 代码，包括 Lit 元素本身，都可以监听事件并根据事件采取行动。例如，工具栏元素可能会在选择菜单项时过滤列表；登录元素在登录按钮的被点击时可能会处理登录相关事物。


## 事件监听

除了标准的 `addEventListener` API 之外，Lit 还引入了一种声明式添加事件监听器的方式。


### 在模板中添加事件监听器

你可以在模板中使用 `@` 表达式将事件监听器添加到组件模板中的元素。渲染模板时添加声明式事件侦听器。

{% playground-example "docs/components/events/child/" "my-element.ts" %}

#### 自定义事件监听选项 {#event-options-decorator}

If you need to customize the event options used for a declarative event listener (like `passive` or `capture`), you can specify these on the listener using the `@eventOptions` decorator. The object passed to `@eventOptions` is passed as the `options` parameter to `addEventListener`.
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

### 向组件或其shadow root上添加事件监听器

可以使用标准的 `addEventListener` DOM 方法向组件本身添加一个监听器，就可以监听来自组件插槽中的子元素以及通过组件模板渲染到shadow DOM中的子元素分发的事件。有关完整详细信息，请参阅 MDN 上的 [EventTarget.addEventListener()](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)。


组件构造函数是在组件上添加事件监听器的好地方。

```js
constructor() {
  super();
  this.addEventListener('click', (e) => console.log(e.type, e.target.localName)));
}
```

向组件本身添加事件监听器是一种事件委托形式，委托可以减少代码或提高性能。请参阅 [事件委托](#event-delegation)了解有关详细信息。通常，在事件委托中，事件的 `target` 属性用于判断是在哪个元素触发了事件并据此来采取对应措施。

However, events fired from the component's shadow DOM are retargeted when heard by an event listener on the component. This means the event target is the component itself. See [Working with events in shadow DOM](#shadowdom) for more information.
但是，当组件上的事件侦听器听到时，从组件的 shadow DOM 触发的事件会被重定向。这意味着事件目标是组件本身。有关详细信息，请参阅 [使用shadow DOM 中的事件](#shadowdom)。

Retargeting can interfere with event delegation, and to avoid it, event listeners can be added to the component's shadow root itself. Since the `shadowRoot` is not available in the `constructor`, event listeners can added in the `createRenderRoot` method as follows. Please note that it's important to make sure to return the shadow root from the `createRenderRoot` method.

{% playground-example "docs/components/events/host/" "my-element.ts" %}

### Adding event listeners to other elements

If your component adds an event listener to anything except itself or its templated DOM – for example, to `Window`, `Document`, or some element in the main DOM – you should add the listener in `connectedCallback` and remove it in `disconnectedCallback`.

*   Removing the event listener in `disconnectedCallback` ensures that any memory allocated by your component will be cleaned up when your component is destroyed or disconnected from the page.

*   Adding the event listener in `connectedCallback` (instead of, for example, the constructor or `firstUpdated`) ensures that your component will re-create its event listener if it is disconnected and subsequently reconnected to DOM.

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

See the MDN documentation on using custom elements [lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) for more information on `connectedCallback` and `disconnectedCallback`.

### Optimizing for performance

Adding event listeners is extremely fast and typically not a performance concern. However, for components that are used in high frequency and need a lot of event listeners, you can optimize first render performance by reducing the number of listeners used via [event delegation](#event-delegation) and adding listeners [asynchronously](#async-events) after rendering.

#### Event delegation { #event-delegation }

Using event delegation can reduce the number of event listeners used and therefore improve performance. It is also sometimes convenient to centralize event handling to reduce code. Event delegation can only be use to handle events that `bubble`. See [Dispatching events](#dispatching-events) for details on bubbling.

Bubbling events can be heard on any ancestor element in the DOM. You can take advantage of this by adding a single event listener on an ancestor component to be notified of a bubbling event dispatched by any of its descendants in the DOM. Use the event's `target` property to take specific action based on the element that dispatched the event.

{% playground-example "docs/components/events/delegation/" "my-element.ts" %}

#### Asynchronously adding event listeners { #async-events }

To add an event listener after rendering, use the `firstUpdated` method. This is a Lit lifecycle callback which runs after the component first updates and renders its templated DOM.

The `firstUpdated` callback fires after the first time your component has been updated and called its `render` method, but **before** the browser has had a chance to paint.

See [firstUpdated](/docs/components/lifecycle/#firstupdated) in the Lifecycle documentation for more information.

To ensure the listener is added after the user can see the component, you can await a Promise that resolves after the browser paints.

```js
async firstUpdated() {
  // Give the browser a chance to paint
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

### Understanding `this` in event listeners

Event listeners added using the declarative `@` syntax in the template are automatically _bound_ to the component.

Therefore, you can use `this` to refer to your component instance inside any declarative event handler:

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

When adding listeners imperatively with `addEventListener`, you'll want to use an arrow function so that `this` refers to the component:

```ts
export class MyElement extends LitElement {
  private _handleResize = () => {
    // `this` refers to the component
    console.log(this.isConnected);
  }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

See the [documentation for `this` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) for more information.

### Listening to events fired from repeated templates

When listening to events on repeated items, it's often convenient to use [event delegation](#event-delegation) if the event bubbles. When an event does not bubble, a listener can be added on the repeated elements. Here's an example of both methods:

{% playground-example "docs/components/events/list/" "my-element.ts" %}

## Dispatching events { #dispatching-events }

All DOM nodes can dispatch events using the `dispatchEvent` method. First, create an event instance, specifying the event type and options. Then pass it to `dispatchEvent` as follows:

```js
const event = new Event('my-event', {bubbles: true, composed: true});
myElement.dispatchEvent(event);
```

The `bubbles` option allows the event to flow up the DOM tree to ancestors of the dispatching element. It's important to set this flag if you want the event to be able to participate in [event delegation](#event-delegation).

The `composed` option is useful to set to allow the event to be dispatched above the shadow DOM tree in which the element exists.

See [Working with events in shadow DOM](#shadowdom) for more information.

See [EventTarget.dispatchEvent()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) on MDN for a full description of dispatching events.

### When to dispatch an event

Events should be dispatched in response to user interaction or asynchronous changes in the component's state. They should generally **not** be dispatched in response to state changes made by the owner of the component via its property or attribute APIs. This is generally how native web platform elements work.

For example, when a user types a value into an `input` element a `change` event is dispatched, but if code sets the `input`'s `value` property, a `change` event is **not** dispatched.

Similarly, a menu component should dispatch an event when the user selects a menu item, but it should not dispatch an event if, for example, the menu's `selectedItem` property is set.

This typically means that a component should dispatch an event in response to another event to which it is listening.

{% playground-ide "docs/components/events/dispatch/" "my-dispatcher.ts" %}

### Dispatching events after an element updates

Often, an event should be fired only after an element updates and renders. This might be necessary if an event is intended to communicate a change in rendered state based on user interaction. In this case, the component's `updateComplete` Promise can be awaited after changing state, but before dispatching the event.

{% playground-ide "docs/components/events/update/" "my-dispatcher.ts" %}

### Using standard or custom events { #standard-custom-events }

Events can be dispatched either by constructing an `Event` or a `CustomEvent`. Either is a reasonable approach. When using a `CustomEvent`, any event data is passed in the event's `detail` property. When using an `Event`, an event subclass can be made and custom API attached to it.

See [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event) on MDN for details about constructing events.

#### Firing a custom event:

```js
const event = new CustomEvent('my-event', {
  detail: {
    message: 'Something important happened'
  }
});
this.dispatchEvent(event);
```

See the [MDN documentation on custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) for more information.

#### Firing a standard event:

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

## 使用 shadow DOM 中事件 {#shadowdom}

When using shadow DOM there are a few modifications to the standard event system that are important to understand. Shadow DOM exists primarily to provide a scoping mechanism in the DOM that encapsulates details about these "shadow" elements. As such, events in shadow DOM encapsulate certain details from outside DOM elements.
需要弄清楚一件很重要的事情，就是当使用shadow DOM时，它的事件系统与标准事件系统由一些细微差异。shadow DOM的存在主要是为了在DOM中提供一种作用域机制去封装“shadow”元素的细节。因此，shadow DOM 中的事件封装了来自外部 DOM 元素的某些细节。

### 理解组合事件分发 {#shadowdom-composed}

默认情况下，在shadow root内部分发的事件对外部是不可见的。如果想要使事件穿过 shadow DOM 边界，你必须将 [`composed` 属性](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/composed) 设置为 `true`。`composed` 与 `bubbles` 搭配使用是很常见的用法，这样 DOM 树中的所有节点都可以看到该事件：

```js
_dispatchMyEvent() {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true });
  this.dispatchEvent(myEvent);
}
```

If an event is `composed` and does `bubble`, it can be received by all ancestors of the element that dispatches the event—including ancestors in outer shadow roots. If an event is `composed` but does not `bubble`, it can only be received on the element that dispatches the event and on the host element containing the shadow root.

Note that most standard user interface events, including all mouse, touch, and keyboard events, are both bubbling and composed. See the [MDN documentation on composed events](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) for more information.

### Understanding event retargeting {#shadowdom-retargeting}

[Composed](#shadowdom-composed) events dispatched from within a shadow root are retargeted, meaning that to any listener on an element hosting a shadow root or any of its ancestors, they appear to come from the hosting element. Since Lit components render into shadow roots, all composed events dispatched from inside a Lit component appear to be dispatched by the Lit component itself. The event's `target` property is the Lit component.

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

In advanced cases where it is required to determine the origin of an event, use the `event.composedPath()` API. This method returns an array of all the nodes traversed by the event dispatch, including those within shadow roots. Because this breaks encapsulation, care should be taken to avoid relying on implementation details that may be exposed.  Common use cases include determining if the element clicked was an anchor tag, for purposes of client-side routing.

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```
See the [MDN documentation on composedPath](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath) for more information.

## Communicating between the event dispatcher and listener

Events exist primarily to communicate changes from the event dispatcher to the event listener, but events can also be used to communicate information from the listener back to the dispatcher.

One way you can do this is to expose API on events which listeners can use to customize component behavior. For example, a listener can set a property on a custom event's detail property which the dispatching component then uses to customize behavior.

Another way to communicate between the dispatcher and listener is via the `preventDefault()` method. It can be called to indicate the event's standard action should not occur. When the listener calls `preventDefault()`, the event's `defaultPrevented` property becomes true. This flag can then be used by the listener to customize behavior.

Both of these techniques are used in the following example:

{% playground-ide "docs/components/events/comm/" "my-listener.ts" %}
