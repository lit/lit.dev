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

虽然 Lit 附带了许多 [内置指令]({{baseurl}}/docs/templates/directives/)，例如 [`repeat()`]({{baseurl}}/docs/templates/directives/#repeat) 和 [`cache()`]({{baseurl}}/docs/templates/directives/#cache），用户也可以编写自己的自定义指令。自定义指令有两种：

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
*  `update()`, 用于命令式 DOM 访问。

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

### 命令式 DOM 访问: update()

在更高级的场景中，你的指令可能需要访问底层 DOM 并命令式读取或修改它。 你可以通过覆盖 `update()` 回调来实现这一点。

`update()` 回调接受两个参数：

*   带有 API 的 `Part` 对象，用于直接管理与表达式关联的 DOM。
*   一个包含 `render()` 参数的数组。

你的 `update()` 方法应该返回 Lit 可以渲染的东西，或者如果不需要重新渲染，则返回特殊值 `noChange`。 `update()` 回调非常灵活，但典型用途包括：

- 从 DOM 读取数据，并使用数据来生成要渲染的值。
- 使用 `Part` 对象上的 `element` 或 `parentNode` 引用命令式更新 DOM。 在这种情况下，`update()` 通常会返回 `noChange`，表明 Lit 不需要采取任何进一步的措施来渲染指令。

#### Parts

每个位置的表达式都有特定的 `Part` 对象:

*   {% api "ChildPart" %} 用于 HTML 子节点位置中的表达式。
*   {% api "AttributePart" %} 用于 HTML 属性（attribute）值位置中的表达式。
*   {% api "BooleanAttributePart" %} 用于布尔属性（attribue）值中的表达式（名称以 `?` 为前缀）。
*   {% api "EventPart" %} 用于事件监听器位置中的表达式（名称以 `@` 为前缀）。
*   {% api "PropertyPart" %} 用于属性（property）值位置的表达式（名称以 `.` 为前缀）。
*   {% api "ElementPart" %} 用于元素标签的表达式。

除了 `PartInfo` 中包含的特定 part 的元数据之外，所有 `Part` 类型都提供对与表达式关联的 DOM `element`（或者，如果是`ChildPart` 的话，就是 `parentNode` ）的访问，这样就可以直接在 `update()` 中访问。 例如：

{% switchable-sample %}

```ts
// 渲染父元素的属性（attribute）名为文本内容
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
// 渲染为: `<div a b>a b</div>`
```

```js
// 渲染父元素的属性（attribute）名为文本内容
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
// 渲染为: `<div a b>a b</div>`
```

{% endswitchable-sample %}

此外，`directive-helpers.js` 模块包括许多作用于 `Part` 对象的辅助函数，可用于在指令的 `ChildPart` 中动态创建、插入和移动部分。

#### 在 update() 中调用 render() 

`update()` 的默认实现只是简单地调用 `render()` 并返回其返回值。 如果你重写了 `update()` 并且仍想调用 `render()` 来生成一个值，那么你需要显式地调用 `render()`。

`render()` 参数会以数组的形式传递给 `update()`。 你可以像这样将参数传递给`render()`：

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

### update() 和 render() 的区别

虽然 `update()` 回调比 `render()` 回调更强大，但有一个重要区别：当使用 `@lit-labs/ssr` 包进行服务器端渲染 (SSR) 时，_只有_ ` render()` 方法会在服务器上调用。 为了与 SSR 兼容，指令应该从 `render()` 返回值，并且仅将 `update()` 用于需要访问 DOM 的逻辑。

## 无改变的信号

有时，指令可能没有任何新内容可供 Lit 渲染。 此时，可以从 `update()` 或 `render()` 方法返回 `noChange` 来向外部发出无改变的信号。 这与返回 `undefined` 不同，因为 `undefined` 会导致 Lit 清除与指令关联的 `Part`。 而返回 `noChange` 会保留先前渲染的值。

返回 `noChange` 的几个常见原因：

*   根据输入值，没有什么新东西可以渲染。
*   在 `update()` 方法中命令式地更新了 DOM。
*   在异步指令中，对 `update()` 或 `render()` 的调用可能会返回 `noChange`，因为 _尚未_ 渲染任何内容。

例如，指令可以跟踪传递给它的上一个值，并执行自己的脏值检查以确定指令的输出是否需要更新。 `update()` 或 `render()` 方法可以返回 `noChange` 来表示指令的输出不需要重新渲染。

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
      // 昂贵而精美的文本差异算法
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
      // 昂贵而精美的文本差异算法
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

{% endswitchable-sample %}

## 将指令限制为一种表达式类型

某些指令仅在一种上下文中有用，例如属性表达式或子表达式。 如果放置在错误的上下文中，该指令应该抛出一个适当的错误。

例如，`classMap` 指令验证它仅用于 `AttributePart` 并且仅用于 `class` 属性：

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

## 异步指令


前面示例中的指令都是是同步的，即：它们从自己的 `render()`/`update()` 生命周期回调同步返回值，因此它们的结果可以在组件的 `update()` 回调期间写入 DOM。

但是有时候你可能希望指令能够异步更新 DOM——例如，指令依赖网络请求等异步事件。

继承自 {% api "AsyncDirective" %} 基类的指令，就可以异步更新其的结果。{% api "AsyncDirective" %} 提供了一个`setValue()` API。 `setValue()` 允许指令在模板的正常 `update`/`render` 循环之外将新值“推送”到其模板表达式中。

这是一个渲染 Promise 值的简单异步指令的示例：

{% switchable-sample %}

```ts
class ResolvePromise extends AsyncDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // 异步渲染:
      this.setValue(resolvedValue);
    });
    // 同步渲染:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

```js
class ResolvePromise extends AsyncDirective {
  render(promise) {
    Promise.resolve(promise).then((resolvedValue) => {
      // 异步渲染：
      this.setValue(resolvedValue);
    });
    // 同步渲染:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

{% endswitchable-sample %}

在这里，渲染的模板会首先显示“Waiting for promise to resolve”，然后才是 promise 的 resolve 值，无论何时 resolve。

异步指令通常需要订阅外部资源。 为防止内存泄漏，异步指令应在指令实例不再使用时取消订阅或释放资源。 为此，`AsyncDirective` 提供了以下额外的生命周期回调和 API：

* `disconnected()`: 当指令不再使用时调用。 指令实例在三种情况下 disconnect：
  - 当指令所在的 DOM 树从 DOM 中移除时。
  - 当指令的宿主元素 disconnect 时。
  - 当产生指令的表达式不再解析为同一指令时。

  在指令接收到 `disconnected` 回调后，它应该释放自己可能在 `update` 或 `render` 期间订阅的所有资源，以防止内存泄漏。

* `reconnected()`：在之前 disconnected 的指令被重新使用时调用。 由于 DOM 子树可以暂时被 disconnect，然后再重新 connect，因此 disconnected 的指令可能需要对重新 connect 做出反应。 这方面的示例包括移除和缓存 DOM 以供后续使用，或者移动宿主元素导致 disconnect 和重新 connect。 `reconnected()` 回调应始终与 `disconnected()` 一起实现，以便将 disconnected 的指令恢复到其工作状态。

* `isConnected`：返回指令的当前 connect 状态。

<div class="alert alert-info">

请注意，存在一种可能：异步指令（由于所处的的 DOM 树被重新渲染）被 disconnect 后仍然收到更新。 因此，在订阅任何长期持有的资源之前，`update` 和/或 `render` 应该始终检查 `this.isConnected` 标志以防止内存泄漏。

</div>

下面是一个订阅 `Observable` 并适当处理 connect 和 disconnect 的指令的示例：

{% switchable-sample %}

```ts
class ObserveDirective extends AsyncDirective {
  observable: Observable<unknown> | undefined;
  unsubscribe: (() => void) | undefined;
  // 当 observeable 改变时，取消订阅旧的对象， 订阅新的对象
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
  // 订阅 observable 对象，每次值发生改变的时候，调用指令的异步 setValue API
  subscribe(observable: Observable<unknown>) {
    this.unsubscribe = observable.subscribe((v: unknown) => {
      this.setValue(v);
    });
  }
  // 当指令从 DOM 中 disconnect 时，取消订阅确保指令实例能被垃圾回收
  disconnected() {
    this.unsubscribe!();
  }
  // 如果指令所在的子树已 disconnected，随后重新 connected，那么重新订阅以使指令再次可操作
  reconnected() {
    this.subscribe(this.observable!);
  }
}
export const observe = directive(ObserveDirective);
```

```js
class ObserveDirective extends AsyncDirective {
  // 当 observeable 改变时，取消订阅旧的对象， 订阅新的对象
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
 // 订阅 observable 对象，每次值发生改变的时候，调用指令的异步 setValue API
  subscribe(observable) {
    this.unsubscribe = observable.subscribe((v) => {
      this.setValue(v);
    });
  }
  // 当指令从 DOM 中 disconnect 时，取消订阅确保指令实例能被垃圾回收
  disconnected() {
    this.unsubscribe();
  }
  // 如果指令所在的子树已 disconnected，随后重新 connected，那么重新订阅以使指令再次可操作
  reconnected() {
    this.subscribe(this.observable);
  }
}
export const observe = directive(ObserveDirective);
```

{% endswitchable-sample %}
