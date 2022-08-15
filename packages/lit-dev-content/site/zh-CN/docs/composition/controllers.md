---
title: 响应式控制器
eleventyNavigation:
  parent: 组合
  key: 控制器
  order: 4
---

Lit 2 引入了一个叫做 _响应式控制器_ 的新的代码重用和组合的概念。

响应式控制器是一个可以挂钩到组件的 [响应式更新周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle) 的对象。控制器可以打包与功能相关的状态和行为，使其可跨多个组件定义重用。

你可以使用控制器来实现需要维护自己的状态和访问组件生命周期的功能，例如：

* 处理鼠标事件等全局事件
* 管理异步任务，例如通过网络获取数据
* 运行动画

响应式控制器允许你通过组合本身不是组件的较小部分来构建组件。它们可以被认为是具有自己的身份和状态的可重用的部分组件的定义。

{% playground-ide "docs/controllers/overview" "clock-controller.ts" %}

响应式控制器在许多方面与类 mixin 相似。 主要区别在于控制器有自己的身份并且不会添加到组件的原型中，这有助于打包它们的 API 并允许你在每个宿主组件中使用多个控制器实例。 有关详细信息，请参阅 [控制器和 mixin]({{baseurl}}/docs/composition/overview/#controllers-and-mixins)。

## 使用控制器 {#using-a-controller}

每个控制器都有自己的创建 API，通常你会创建一个实例并将其保存在组件中：

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

与控制器实例关联的组件称为宿主组件。

控制器实例需要注册自己，才能接收来自宿主组件的生命周期回调，并在控制器有新数据要渲染时触发宿主更新。这就是 `ClockController` 示例定期渲染当前时间的方式。

控制器通常会公开一些要在宿主的 `render()` 方法中使用的功能。 例如，许多控制器会有一些状态，比如当前值：

```ts
  render() {
    return html`
      <div>Current time: ${this.clock.value}</div>
    `;
  }
```

由于每个控制器都有自己的 API，请参阅特定控制器文档了解如何使用它们。

## 编写控制器 {#writing-a-controller}

响应式控制器是与宿主组件关联的对象，它可以实现一个或多个宿主生命周期回调或与其宿主进行交互。控制器可以通过多种方式实现，但我们只专注于使用 JavaScript 类，包括用于初始化的构造函数和用于生命周期的方法。

### 初始化控制器 {#controller-initialization}

控制器通过调用 `host.addController(this)` 向其宿主组件注册自己。 通常，控制器需要保存其宿主组件的引用，以便之后可以与之交互。

{% switchable-sample %}

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    // 保存宿主组件的引用
    this.host = host;
    // 注册生命周期更新
    host.addController(this);
  }
}
```

```js
class ClockController {
  constructor(host) {
    // 保存宿主组件的引用
    this.host = host;
    // 注册生命周期更新
    host.addController(this);
  }
}
```

{% endswitchable-sample %}

你可以为一次性配置新增另外的构造函数参数。

{% switchable-sample %}

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;
  timeout: number

  constructor(host: ReactiveControllerHost, timeout: number) {
    this.host = host;
    this.timeout = timeout;
    host.addController(this);
  }
```

```js
class ClockController {
  constructor(host, timeout) {
    this.host = host;
    this.timeout = timeout;
    host.addController(this);
  }
```

{% endswitchable-sample %}

一旦你的控制器注册到了宿主组件，你就可以向控制器添加生命周期回调和其他类字段和方法，进而实现所需的状态和行为。

### 生命周期 {#lifecycle}

在 [ReactiveController]({{baseurl}}/docs/api/controllers#ReactiveController) 接口中定义的响应式控制器生命周期是响应式更新周期的子集。 LitElement 在其生命周期回调期间会调用任何已注册的控制器的生命周期回调。 这些回调是可选的。

* `hostConnected()`:
  * 宿主元素连接时调用。
   * 在创建 `renderRoot` 后调用，因此此时必定存在一个 shadow root。
   * 用于设置事件监听器、观察者等。
* `hostUpdate()`:
   * 在宿主的 `update()` 和 `render()` 方法之前调用。
   * 用于在更新之前读取 DOM（例如，用于动画）。
* `hostUpdated()`:
   * 在更新之后调用，在宿主的 `updated()` 方法之前。
   * 用于在修改后读取 DOM（例如，用于动画）。
* `hostDisconnected()`:
   * 宿主断开连接时调用。
   * 用于清理在 `hostConnected()` 中添加的东西，例如事件监听器和观察者。

有关详细信息，请参阅 [响应式更新周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle)。

### 控制器宿主 API {#controller-host-api}

响应式控制器的宿主实现了一组用于添加控制器和请求更新的 API，并负责调用其控制器的生命周期方法。

这是控制器的宿主上公开的最小的 API 集合：

* `addController(controller: ReactiveController)`
* `removeController(controller: ReactiveController)`
* `requestUpdate()`
* `updateComplete: Promise<boolean>`

你还可以创建特定于 `HTMLElement`、`ReactiveElement`、`LitElement` 的控制器，并提供更多的这类 API； 甚至是绑定到特定元素类或其他接口的控制器。

`LitElement` 和 `ReactiveElement` 是控制器宿主，但宿主也可以是其他对象，例如来自其他 Web 组件库的基类、来自框架的组件或其他控制器。

### 从其他控制器构建控制器 {#building-controllers-from-other-controllers}

控制器也可以由其他控制器组成。 为此，请创建一个子控制器并将宿主转发给它。

{% switchable-sample %}

```ts
class DualClockController implements ReactiveController {
  private clock1: ClockController;
  private clock2: ClockController;

  constructor(host: ReactiveControllerHost, delay1: number, delay2: number) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() { return this.clock1.value; }
  get time2() { return this.clock2.value; }
}
```

```js
class DualClockController {
  constructor(host, delay1, delay2) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() { return this.clock1.value; }
  get time2() { return this.clock2.value; }
}
```

{% endswitchable-sample %}

### 控制器和指令 {#controllers-and-directives}

将控制器与指令结合起来可能是一项非常强大的技术，尤其是对于需要在渲染之前或之后进行工作的指令，例如动画指令； 或需要引用模板中特定元素的控制器。

使用带有指令的控制器有两种主要模式：
* 控制器指令。 指令本身就是控制器，用于挂钩宿主生命周期。
* 拥有指令的控制器。 是控制器创建一个或多个指令，用于使用宿主的模板。

有关编写指令的更多信息，请参阅 [自定义指令]({{baseurl}}/docs/templates/custom-directives/)。

#### 控制器指令

响应式控制器不需要作为实例字段保存在宿主上。 使用 `addController()` 添加到宿主的任何东西都是控制器。 特殊情况下，指令也可以是控制器。 这使得指令能够挂钩到宿主的生命周期。

#### 拥有指令的控制器

指令不一定是独立的函数，也可以是其他对象的方法，例如控制器。 这在控制器需要对模板中元素的特定引用的情况下很有用。

例如，想象一下要实现一个 ResizeController，然后可以使用它来观察元素的尺寸。 为此，我们需要一个 ResizeController 实例和一个放置在我们想要观察的元素上的指令：

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _textSize = new ResizeController(this);

  render() {
    return html`
      <textarea ${this._textSize.observe()}></textarea>
      <p>The width is ${this._textSize.contentRect?.width}</p>
    `;
  }
}
```

```js
class MyElement extends LitElement {
  _textSize = new ResizeController(this);

  render() {
    return html`
      <textarea ${this._textSize.observe()}></textarea>
      <p>The width is ${this._textSize.contentRect?.width}</p>
    `;
  }
}
```

{% endswitchable-sample %}

要实现这个功能，你需要创建一个指令，然后在方法中调用它：

```ts
class ResizeDirective {
  /* ... */
}
const resizeDirective = directive(ResizeDirective);

export class ResizeController {
  /* ... */
  observe() {
    // 传入控制器的引用，这样指令就可以通知控制器尺寸发生变化
    return resizeDirective(this);
  }
}
```

{% todo %}

- Review and cleanup this example

{% endtodo %}

## 使用场景 {#use-cases}

响应式控制器非常通用，并且具有非常广泛的可能的使用场景。 它们特别适合将组件连接到外部资源，例如用户输入、状态管理或远程 API。 以下是一些常见的场景。

### 外部输入 {#external-inputs}

响应式控制器可用于连接到外部输入。 例如，键盘和鼠标事件、resize 观察器或 mutation 观察器。 控制器可以提供输入的当前值用于渲染，并在值更改时请求宿主更新。

#### 示例: MouseMoveController

该示例展示控制器如何在其宿主连接和断开时执行设置和清理工作，并在输入更改时请求更新：

{% playground-ide "docs/controllers/mouse" "my-element.ts" %}

### 异步任务 {#asynchronous-tasks}

异步任务，例如长时间运行的计算或网络 I/O，通常具有随时间变化的状态，并且需要在任务状态发生变化（完成、错误等）时通知宿主。

控制器是打包任务执行和状态好方法，它使得在组件内引入新功能变得更容易。 用控制器编写的任务，通常具有宿主可以设置的输入和宿主可以渲染的输出。

`@lit-labs/task` 包含一个通用的 `Task` 控制器，它可以从宿主提取输入，执行任务功能，并根据任务状态渲染不同的模板。

你可以使用 `Task` 创建一个自定义控制器，其中包含为你的特定任务量身定制的 API。 在这里，我们将 `Task` 包装在 `NamesController` 中，它可以从 REST API demo 中获取指定的名称列表中的一个。 `NameController` 公开了一个 `kind` 属性作为输入，以及一个 `render()` 方法，该方法可以根据任务状态渲染四个模板的其中一个模板。 任务逻辑以及它如何更新宿主，则是从宿主组件中抽象出来的。

{% playground-ide "docs/controllers/names" %}

{% todo %}

- Animations

{% endtodo %}

## 参考 {#see-also}

* [响应式更新周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle)
* [@lit-labs/task](https://www.npmjs.com/package/@lit-labs/task)
