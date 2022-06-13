---
title: 响应式控制器
eleventyNavigation:
  parent: 组合
  key: 控制器
  order: 4
---

Lit 2 引入了一个叫做 _响应式控制器_ 新的代码重用和组合的概念。

响应式控制器是一个可以挂钩到组件的 [响应式更新周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle) 的对象。控制器可以打包与功能相关的状态和行为，使其可跨多个组件定义重用。

你可以使用控制器来实现需要维护自己的状态和访问组件生命周期的功能，例如：

* 处理鼠标事件等全局事件
* 管理异步任务，例如通过网络获取数据
* 运行动画

响应式控制器允许你通过组合本身不是组件的较小部分来构建组件。它们可以被认为是可重用的部分组件定义，具有自己的身份和状态。

{% playground-ide "docs/controllers/overview" "clock-controller.ts" %}

响应式控制器在许多方面与类 mixin 相似。 主要区别在于控制器有自己的身份并且不会添加到组件的原型中，这有助于打包它们的 API 并允许你在每个宿主组件中使用多个控制器实例。 有关详细信息，请参阅 [控制器和 mixin]({{baseurl}}/docs/composition/overview/#controllers-and-mixins)。

## 使用控制器

每个控制器都有自己的创建 API，但通常你会创建一个实例并将其与组件一起存储：

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

与控制器实例关联的组件称为宿主组件。

控制器实例注册自己以接收来自主机组件的生命周期回调，并在控制器有新数据要渲染时触发宿主更新。这就是 `ClockController` 示例定期渲染当前时间的方式。

控制器通常会公开一些要在宿主的 `render()` 方法中使用的功能。 例如，许多控制器会有一些状态，比如当前值：

```ts
  render() {
    return html`
      <div>Current time: ${this.clock.value}</div>
    `;
  }
```

由于每个控制器都有自己的 API，请参阅特定控制器文档了解如何使用它们。

## 编写控制器

A reactive controller is an object associated with a host component, which implements one or more host lifecycle callbacks or interacts with its host. It can be implemented in a number of ways, but we'll focus on using JavaScript classes, with constructors for initialization and methods for lifecycles.
响应式控制器是与宿主组件关联的对象，它可以实现一个或多个宿主生命周期回调或与其宿主进行交互。控制器可以通过多种方式实现，但我们只专注于使用 JavaScript 类，包括用于初始化的构造函数和用于生命周期的方法。

### 初始化控制器

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

你可以为一次性配置添加其他构造函数参数。

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

### 生命周期

在 {% api "ReactiveController" %} 接口中定义的响应式控制器生命周期是响应式更新周期的子集。 LitElement 在其生命周期回调期间会调用任何已安装的控制器的设生命周期回调。 这些回调是可选的。

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

### 控制器宿主 API

响应式控制器的宿主实现了一组用于添加控制器和请求更新的 API，并负责调用其控制器的生命周期方法。

这是控制器的宿主上公开的最小的 API 集合：

* `addController(controller: ReactiveController)`
* `removeController(controller: ReactiveController)`
* `requestUpdate()`
* `updateComplete: Promise<boolean>`

你还可以创建特定于 `HTMLElement`、`ReactiveElement`、`LitElement` 的控制器，并且需要公开更多的这类 API； 甚至是绑定到特定元素类或其他接口的控制器。

`LitElement` 和 `ReactiveElement` 是控制器宿主，但宿主也可以是其他对象，例如来自其他 Web 组件库的基类、来自框架的组件或其他控制器。

### 利用其他控制器构建新的控制器

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

### 控制器和指令

将控制器与指令结合起来可能是一种非常强大的技术，尤其是对于需要在渲染之前或之后进行工作的指令，例如动画指令； 或需要引用模板中特定元素的控制器。

使用带有指令的控制器有两种主要模式：
* 控制器指令。 这些指令本身就是控制器，用户挂钩宿主生命周期。
* 拥有指令的控制器。 这些是控制器创建一个或多个指令，用于使用宿主的模板。

有关编写指令的更多信息，请参阅 [自定义指令]({{baseurl}}/docs/templates/custom-directives/)。

#### 控制器指令

Reactive controllers do not need to be stored as instance fields on the host. Anything added to a host using `addController()` is a controller. In particular, a directive can also be a controller. This enables a directive to hook into the host lifecycle.

#### 拥有指令的控制器

Directives do not need to be standalone functions, they can be methods on other objects as well, such as controllers. This can be useful in cases where a controller needs a specific reference to an element in a template.

For example, imagine a ResizeController that lets you observe an element's size with a ResizeObserver. To work we need both a ResizeController instance, and a directive that is placed on the element we want to observe:

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

To implement this, you create a directive and call it from a method:

```ts
class ResizeDirective {
  /* ... */
}
const resizeDirective = directive(ResizeDirective);

export class ResizeController {
  /* ... */
  observe() {
    // Pass a reference to the controller so the directive can
    // notify the controller on size changes.
    return resizeDirective(this);
  }
}
```

{% todo %}

- Review and cleanup this example

{% endtodo %}

## 用例

Reactive controllers are very general and have a very broad set of possible use cases. They are particularly good for connecting a component to an external resource, like user input, state management, or remote APIs. Here are a few common use cases.

### 外部输入

Reactive controllers can be used to connect to external inputs. For example, keyboard and mouse events, resize observers, or mutation observers. The controller can provide the current value of the input to use in rendering, and request a host update when the value changes.

#### Example: MouseMoveController

This example shows how a controller can perform setup and cleanup work when its host is connected and disconnected, and request an update when an input changes:

{% playground-ide "docs/controllers/mouse" "my-element.ts" %}

### Asynchronous tasks

Asynchronous tasks, such as long running computations or network I/O, typically have state that changes over time, and will need to notify the host when the task state changes (completes, errors, etc.).

Controllers are a great way to bundle task execution and state to make it easy to use inside a component. A task written as a controller usually has inputs that a host can set, and outputs that a host can render.

`@lit-labs/task` contains a generic `Task` controller that can pull inputs from the host, execute a task function, and render different templates depending on the task state.

You can use `Task` to create a custom controller with an API tailored for your specific task. Here we wrap `Task` in a `NamesController` that can fetch one of a specified list of names from a demo REST API. `NameController` exposes a `kind` property as an input, and a `render()` method that can render one of four templates depending on the task state. The task logic, and how it updates the host, are abstracted from the host component.

{% playground-ide "docs/controllers/names" %}

{% todo %}

- Animations

{% endtodo %}

## See also

* [Reactive update cycle](/docs/components/lifecycle/#reactive-update-cycle)
* [@lit-labs/task](https://www.npmjs.com/package/@lit-labs/task)
