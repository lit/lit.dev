---
title: 自定义指令
eleventyNavigation:
  parent: 模板
  title: 自定义指令
  key: 自定义指令
  order: 6
versionLinks:
  v1: lit-html/creating-directives/
---

指令是可以通过自定义表达式的渲染方式来扩展 Lit 的一类函数。在模板中使用指令就像调用函数一样简单：
```js
html`<div>
     ${fancyDirective('some text')}
  </div>`
```

虽然 Lit 附带了许多 [内置指令]({{baseurl}}/docs/templates/directives/)，例如 [`repeat()`]({{baseurl}}/docs/templates/directives/#repeat) 和 [`cache()`]( /docs/templates/directives/#cache），用户也可以编写自己的自定义指令。自定义指令有两种：

*   函数指令

*   类指令

函数指令返回一个用于渲染的值，它可以接收多个参数，或者没有参数。

```js
export noVowels = (str) => str.replaceAll(/[aeiou]/ig,'x');
```

类指令可以做一些函数指令无法做的事。使用类指令，你可以：

-   直接操作已渲染的 DOM （例如，添加，删除，或者重排已渲染的 DOM 节点）。
-   在多次渲染之间保持状态。
-   在主更新周期之外异步更新 DOM。

本页的其余部分将会描述类指令。

## 创建类指令

要创建一个类指令，你必须:

*   将指令实现为一个继承自类 {% api "Directive" %} 的类。
*   将你的类传递给 {% api "directive()" "directive" %} 工厂，获得可在 Lit 模板表达式中使用的指令函数。

```js
import {Directive, directive} from 'lit/directive.js';

// 定义指令
class HelloDirective extends Directive {
  render() {
    return `Hello!`;
  }
}
// 创建一个指令函数
const hello = directive(HelloDirective);

// 使用指令
const template = html`<div>${hello()}</div>`;
```

计算该模板时，指令 _函数_ (`hello()`) 会返回一个 `DirectiveResult` 对象，该对象要求 Lit 创建或更新 _类_ 指令(`HelloDirective`) 的实例。 然后 Lit 调用指令实例上的方法来运行其更新逻辑。

一些指令需要在正常更新周期之外异步更新 DOM。要创建 _异步指令_，请扩展 `AsyncDirective` 基类而不是 `Directive`。请参阅 [异步指令](#async-directives)了解有关详细信息。

## 类指令的生命周期

指令类有一些内置的生命周期方法：

*  类构造函数，用于一次性初始化。
*  `render()`, 用于声明式渲染。
*  `update()`, 用于强制性 DOM 访问。

你必须为所有指令实现 `render()` 回调，而 `update()` 实现不是必须的。 `update()` 的默认实现是调用并返回 `render()` 的值。

可以在正常更新周期之外更新 DOM 的异步指令，会使用一些额外的生命周期回调。请参阅 [异步指令](#async-directives)了解有关详细信息。

### 一次性设置： constructor()

When Lit encounters a `DirectiveResult` in an expression for the first time, it will construct an instance of the corresponding directive class (causing the directive's constructor and any class field initializers to run):
当 Lit 第一次在表达式中遇到 `DirectiveResult` 时，它将构造相应指令类的实例（这会导致指令的构造函数和类字段初始化程序运行）：

{% switchable-sample %}

```ts
class MyDirective extends Directive {
  // 类字段会被初始化一次，并在不同的渲染之间维护状态
  value = 0;
  // 构造函数仅在表达式第一次使用到指令的时候执行一次
  constructor(partInfo: PartInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

```js
class MyDirective extends Directive {
  // 类字段会被初始化一次，并在不同的渲染之间维护状态
  // state between renders
  value = 0;
  // 构造函数仅在表达式第一次使用到指令的时候执行一次
  constructor(partInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

{% endswitchable-sample %}

在多次渲染中，只要同一个表达式中使用相同的指令函数，那么前一个实例就会被重用，因此实例的状态在渲染之间保持不变。

构造函数接收一个单一的 `PartInfo` 对象，该对象提供有关使用该指令的表达式的元数据。这对于在指令设计为仅用于特定类型的表达式的情况下提供错误检查很有用（参见 [将指令限制为一种表达式类型](#limiting-a-directive-to-one-expression-type))。

### 声明式渲染： render()

`render()` 方法应该返回要渲染到 DOM 中的值。它可以返回任何可渲染的值，包括 `DirectiveResult`。

除了引用指令实例上的状态之外，`render()` 方法还可以接受传入指令函数的任意参数：

```js
const template = html`<div>${myDirective(name, rank)}</div>`
```

为 `render()` 方法定义的参数决定了指令函数的签名：

{% switchable-sample %}

```ts
class MaxDirective extends Directive {
  maxValue = Number.MIN_VALUE;
  // 定义一个可以接收参数的 render 方法：
  render(value: number, minValue = Number.MIN_VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// 调用指令 并传入为 `render()` 方法定义的 `value` 和 `minValue` 参数：
const template = html`<div>${max(someNumber, 0)}</div>`;
```

```js
class MaxDirective extends Directive {
  maxValue = Number.MIN_VALUE;
  // 定义一个可以接收参数的 render 方法：
  render(value, minValue = Number.MIN_VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// 调用指令 并传入为 `render()` 方法定义的 `value` 和 `minValue` 参数：
const template = html`<div>${max(someNumber, 0)}</div>`;
```

{% endswitchable-sample %}

### 强制性 DOM 访问 Imperative DOM access: update()

在更高级的场景中，你的指令可能需要访问底层 DOM 并强制读取或修改它。 你可以通过覆盖 `update()` 回调来实现这一点。

The `update()` callback receives two arguments:

*   A `Part` object with an API for directly managing the DOM associated with the expression.
*   An array containing the `render()` arguments.

Your `update()` method should return something Lit can render, or the special value `noChange` if no re-rendering is required. The `update()` callback is quite flexible, but typical uses include:

- Reading data from the DOM, and using it to generate a value to render.
- Imperatively updating the DOM using the `element` or `parentNode` reference on the `Part` object. In this case, `update()` usually returns `noChange`, indicating that Lit doesn't need to take any further action to render the directive.

#### Parts

Each expression position has its own specific `Part` object:

*   {% api "ChildPart" %} for expressions in HTML child position.
*   {% api "AttributePart" %} for expressions in HTML attribute value position.
*   {% api "BooleanAttributePart" %} for expressions in a boolean attribute value (name prefixed with `?`).
*   {% api "EventPart" %} for expressions in an event listener position (name prefixed with `@`).
*   {% api "PropertyPart" %} for expressions in property value position (name prefixed with `.`).
*   {% api "ElementPart" %} for expressions on the element tag.

In addition to the part-specific metadata contained in `PartInfo`, all `Part` types provide access to the DOM `element` associated with the expression (or `parentNode`, in the case of `ChildPart`), which may be directly accessed in `update()`. For example:

{% switchable-sample %}

```ts
// Renders attribute names of parent element to textContent
class AttributeLogger extends Directive {
  attributeNames = '';
  update(part: ChildPart) {
    this.attributeNames = (part.parentNode as Element).getAttributeNames?.().join(' ');
    return this.render();
  }
  render() {
    return this.attributeNames;
  }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

```js
// Renders attribute names of parent element to textContent
class AttributeLogger extends Directive {
  attributeNames = '';
  update(part) {
    this.attributeNames = part.parentNode.getAttributeNames?.().join(' ');
    return this.render();
  }
  render() {
    return this.attributeNames;
  }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

{% endswitchable-sample %}

In addition, the `directive-helpers.js` module includes a number of helper functions which act on `Part` objects, and can be used to dynamically create, insert, and move parts within a directive's `ChildPart`.

#### Calling render() from update()

The default implementation of `update()` simply calls and returns the value from `render()`. If you override `update()` and still want to call `render()` to generate a value, you need to call `render()` explicitly.

The `render()` arguments are passed into `update()` as an array. You can pass the arguments to `render()` like this:

{% switchable-sample %}

```ts
class MyDirective extends Directive {
  update(part: Part, [fish, bananas]: DirectiveParameters<this>) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish: number, bananas: number) { ... }
}
```

```js
class MyDirective extends Directive {
  update(part, [fish, bananas]) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish, bananas) { ... }
}
```

{% endswitchable-sample %}

### Differences between update() and render()

While the `update()` callback is more powerful than the `render()` callback, there is an important distinction: When using the `@lit-labs/ssr` package for server-side rendering (SSR), _only_ the `render()` method is called on the server. To be compatible with SSR, directives should return values from `render()` and only use `update()` for logic that requires access to the DOM.

## Signaling no change

Sometimes a directive may have nothing new for Lit to render. You signal this by returning `noChange` from the `update()` or `render()` method. This is different from returning `undefined`, which causes Lit to clear the `Part` associated with the directive. Returning `noChange` leaves the previously rendered value in place.

There are several common reasons for returning `noChange`:

*   Based on the input values, there's nothing new to render.
*   The `update()` method updated the DOM imperatively.
*   In an async directive, a call to `update()` or `render()` may return `noChange` because there's nothing to render _yet_.

For example, a directive can keep track of the previous values passed in to it, and perform its own dirty checking to determine whether the directive's output needs to be updated. The `update()` or `render()` method can return `noChange`  to signal that the directive's output doesn't need to be re-rendered.

{% switchable-sample %}

```ts
import {Directive} from 'lit/directive.js';
import {noChange} from 'lit';
class CalculateDiff extends Directive {
  a?: string;
  b?: string;
  render(a: string, b: string) {
    if (this.a !== a || this.b !== b) {
      this.a = a;
      this.b = b;
      // Expensive & fancy text diffing algorithm
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

```js
import {Directive} from 'lit/directive.js';
import {noChange} from 'lit';
class CalculateDiff extends Directive {
  render(a, b) {
    if (this.a !== a || this.b !== b) {
      this.a = a;
      this.b = b;
      // Expensive & fancy text diffing algorithm
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

{% endswitchable-sample %}

## Limiting a directive to one expression type

Some directives are only useful in one context, such as an attribute expression or a child expression. If placed in the wrong context, the directive should throw an appropriate error.

For example, the `classMap` directive validates that it is only used in an `AttributePart` and only for the `class` attribute`:

{% switchable-sample %}

```ts
class ClassMap extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class'
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

```js
class ClassMap extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class'
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

{% endswitchable-sample %}

## Async directives

The previous example directives are synchronous: they return values synchronously from their `render()`/`update()` lifecycle callbacks, so their results are written to the DOM during the component's `update()` callback.

Sometimes, you want a directive to be able to update the DOM asynchronously—for example, if it depends on an asynchronous event like a network request.

To update a directive's result asynchronously, a directive needs to extend the {% api "AsyncDirective" %} base class, which provides a `setValue()` API. `setValue()` allows a directive to "push" a new value into its template expression, outside of the template's normal `update`/`render` cycle.

Here's an example of a simple async directive that renders a Promise value:

{% switchable-sample %}

```ts
class ResolvePromise extends AsyncDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

```js
class ResolvePromise extends AsyncDirective {
  render(promise) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

{% endswitchable-sample %}

Here, the rendered template shows "Waiting for promise to resolve," followed by the resolved value of the promise, whenever it resolves.

Async directives often need to subscribe to external resources. To prevent memory leaks async directives should unsubscribe or dispose of resources when the directive instance is no longer in use.  For this purpose, `AsyncDirective` provides the following extra lifecycle callbacks and API:

* `disconnected()`: Called when a directive is no longer in use.  Directive instances are disconnected in three cases:
  - When the DOM tree the directive is contained in is removed from the DOM
  - When the directive's host element is disconnected
  - When the expression that produced the directive no longer resolves to the same directive.

  After a directive receives a `disconnected` callback, it should release all resources it may have subscribed to during `update` or `render` to prevent memory leaks.

* `reconnected()`: Called when a previously disconnected directive is being returned to use. Because DOM subtrees can be temporarily disconnected and then reconnected again later, a disconnected directive may need to react to being reconnected. Examples of this include when DOM is removed and cached for later use, or when a host element is moved causing a disconnection and reconnection. The `reconnected()` callback should always be implemented alongside `disconnected()`, in order to restore a disconnected directive back to its working state.

* `isConnected`: Reflects the current connection state of the directive.

<div class="alert alert-info">

Note that it is possible for an `AsyncDirective` to continue receiving updates while it is disconnected if its containing tree is re-rendered. Because of this, `update` and/or `render` should always check the `this.isConnected` flag before subscribing to any long-held resources to prevent memory leaks.

</div>

Below is an example of a directive that subscribes to an `Observable` and handles disconnection and reconnection appropriately:

{% switchable-sample %}

```ts
class ObserveDirective extends AsyncDirective {
  observable: Observable<unknown> | undefined;
  unsubscribe: (() => void) | undefined;
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable: Observable<unknown>) {
    if (this.observable !== observable) {
      this.unsubscribe?.();
      this.observable = observable
      if (this.isConnected)  {
        this.subscribe(observable);
      }
    }
    return noChange;
  }
  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  subscribe(observable: Observable<unknown>) {
    this.unsubscribe = observable.subscribe((v: unknown) => {
      this.setValue(v);
    });
  }
  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.unsubscribe!();
  }
  // If the subtree the directive is in was disconnected and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable!);
  }
}
export const observe = directive(ObserveDirective);
```

```js
class ObserveDirective extends AsyncDirective {
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable) {
    if (this.observable !== observable) {
      this.unsubscribe?.();
      this.observable = observable
      if (this.isConnected)  {
        this.subscribe(observable);
      }
    }
    return noChange;
  }
  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  subscribe(observable) {
    this.unsubscribe = observable.subscribe((v) => {
      this.setValue(v);
    });
  }
  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.unsubscribe();
  }
  // If the subtree the directive is in was disconneted and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable);
  }
}
export const observe = directive(ObserveDirective);
```

{% endswitchable-sample %}
