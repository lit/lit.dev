---
title: 生命周期
eleventyNavigation:
  key: 生命周期
  parent: 组件
  order: 5
versionLinks:
  v1: components/lifecycle/
---

Lit 组件使用标准的自定义元素生命周期方法。 此外，Lit 还引入了一个响应式更新周期，当响应式属性发生变化时，它会将更改的内容呈现到 DOM 上。  

## 标准自定义元素生命周期 { #custom-element-lifecycle }

Lit 组件是标准的自定义元素，并继承了自定义元素的生命周期方法。 请查看 MDN上 的 [使用生命周期回调](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements#%E4%BD%BF%E7%94%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0) 了解更多有关自定义元素生命周期的信息。  

<div class="alert alert-info">

如果你需要定制任何标准的自定义元素生命周期方法，请确保调用 `super` 上的实现（例如 `super.connectedcallback()`），这样才能保持 Lit 的标准功能。  

</div>

### constructor() {#constructor}

创建元素时调用。 此外，当现有元素升级时也会调用它，如果一个自定义元素已经存在于 DOM 中，然后关于它的定义又被重新加载，就会触发元素升级。

#### Lit 行为 

使用 `requestUpdate()` 方法请求异步更新，因此当 Lit 组件升级时，会立即执行更新。

保存已在元素上设置的所有属性（property）。这可确保组件升级前设置的值被保留下来，并正确覆盖组件设置的默认值。

#### 用例

一次性初始化任务必须在第一次 [更新](#reactive-update-cycle) 之前执行完成。例如，不使用装饰器时，可以在构造函数中设置属性的默认值，如[在静态属性字段中声明属性]({{baseurl}}/docs/components/properties/#declaring-properties-in-a-static-properties-field)。

```js
constructor() {
  super();
  this.foo = 'foo';
  this.bar = 'bar';
}
```
### connectedCallback() {#connectedcallback}

在将组件添加到文档的 DOM 时调用。

#### Lit 行为

Lit 在元素连接后启动第一个元素更新周期。在准备渲染时，Lit 还要确保已经创建了 `renderRoot`（通常是组件的`shadowRoot`）。

一旦元素连接到文档，哪怕只有一次，之后无论元素的连接状态如何，组件更新都会继续进行。

#### 用例

在 `connectedCallback()` 中，你应该设置仅在元素连接到文档时才发生的任务。其中最常见的是将事件监听器添加到元素外部的节点，例如添加到窗口的 keydown 事件处理程序。通常，在 `connectedCallback()` 中所做的任何事情都应该在元素断开连接时撤消 - 例如，删除窗口上的事件监听器以防内存泄漏。

```js
connectedCallback() {
  super.connectedCallback()
  addEventListener('keydown', this._handleKeydown);
}
```
### disconnectedCallback() {#disconnectedcallback}

当组件从文档的 DOM 中移除时调用。

#### Lit 行为

暂停 [响应式更新周期](#reactive-update-cycle)。当元素连接时恢复。

#### 用例

这个回调是元素的一个重要信号：它可能不再被使用了；因此，应该在 `disconnectedCallback()` 中确保没有任何东西持有对该元素的引用（例如：添加到元素外部节点的事件监听器），以便它可以被垃圾回收机制自由地回收。因为元素可能在断开连接后重新连接，例如元素在 DOM 中移动或缓存的情况，任何此类引用或监听器都可能需要通过 `connectedCallback()` 重新建立，以便元素在这种情况下可以继续按预期运行。例如删除元素外部节点的事件监听器，例如添加到窗口的 keydown 事件处理程序。

```js
disconnectedCallback() {
  super.disconnectedCallback()
  window.removeEventListener('keydown', this._handleKeydown);
}
```

<div class="alert alert-info">

**没必要移除内部事件监听器。** 你不需要移除添加到组件自己的 DOM 上的事件监听器——包括那些以声明方式添加到你的模板中的事件监听器。与外部事件监听器不同，内部事件监听器不会阻止组件被垃圾回收机制回收。

</div>

### attributeChangedCallback() { %attributeChangedCallback }

元素的任何一个 `observedAttributes` 更改时调用。

#### Lit 行为

Lit 使用该回调将 attribute 的更改同步到响应式属性。具体来说，当设置了一个 attribute 时，就设置了相应的 property。 Lit 还会自动设置元素的 `observedAttributes` 数组以匹配组件的响应式属性列表。

#### 用例

你很少需要实现这个回调。

### adoptedCallback() {#adoptedcallback}

当组件移动到新的文档（document）时调用。

<div class="alert alert-info">

请注意，`adoptedCallback` 不是 polyfill。

</div>

#### Lit 行为

Lit 没有针对这个回调的默认行为。

#### 用例

此回调应仅用于高级用例，即元素行为应在更改文档时发生更改。

## 响应式更新周期 { #reactive-update-cycle }

除了标准的自定义元素生命周期之外，Lit 组件还实现了响应式式更新周期。

当响应式属性被更改或显式调用 `requestUpdate()` 方法时，会触发响应式更新周期。 Lit 执行更新是异步的，因此属性更改是批处理的——如果在请求更新后但在更新开始之前有更多属性被更改，则所有更改都会在同一个更新中被捕获。

Lit的更新发生在微任务中，这意味着它们发生在浏览器将下一帧绘制到屏幕之前。请参阅 [Jake Archibald 的文章](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)了解更多有关浏览器微任务的信息。

概括地说，响应式更新周期是：

1. 当一个或多个属性被更改或调用 `requestUpdate()` 时会安排更新。
1. 在绘制下一帧之前执行更新。
    1. 设置反射属性（attribute）。
    1. 调用组件的 render 方法来更新其内部 DOM。
1. 更新完成并且 `updateComplete` promise 被 resolve.

更详细地说，更新流程如下图所示：

**Pre-Update**

<img class="centered-image" src="/images/docs/components/update-1.jpg">

<p><img class="centered-image" src="/images/docs/components/update-2.jpg"></p>

**Update**

<img class="centered-image" src="/images/docs/components/update-3.jpg">

**Post-Update**

<img class="centered-image" src="/images/docs/components/update-4.jpg">

### 触发更新 {#reactive-update-cycle-triggering}

当响应式属性被更改或调用 `requestUpdate()` 方法时会触发更新。由于更新是异步执行的，因此在执行更新之前发生的所有更改都只会导致**一次更新**。

#### hasChanged() {#haschanged}

在设置响应式属性时调用。默认情况下，`hasChanged()` 会进行严格相等比较，如果返回 `true`，则会安排更新。请参阅 [配置 `hasChanged()`](/docs/components/properties/#haschanged)了解更多详细信息。

#### requestUpdate() {#requestUpdate}

调用 `requestUpdate()` 来显式安排更新。如果你需要在与属性无关的内容发生更改时更新和渲染元素，这将很有用。例如，计时器组件可能每秒调用一次 `requestUpdate()`。
 
```js
connectedCallback() {
  super.connectedCallback();
  this._timerInterval = setInterval(() => this.requestUpdate(), 1000);
}

disconnectedCallback() {
  super.disconnectedCallback();
  clearInterval(this._timerInterval);
}
```

被更改的属性（property）列表存储一个 map 中，然后将该 map 传递给所有后续生命周期方法。 map 的键是属性名称，值是更改前的属性值。

或者，你可以在调用 `requestUpdate()` 时传递属性名称和更新前的值，这些值将存储在 `changedProperties` map 中。如果你要为属性实现自定义 getter 和 setter，这将很有用。请参阅 [响应式属性]({{baseurl}}/docs/components/properties/)了解更多有关实现自定义 getter 和 setter 的信息。

```js
  this.requestUpdate('state', this._previousState);
```

### 执行更新 {#reactive-update-cycle-performing}

执行更新时，会调用 `performUpdate()` 方法。该方法会调用许多其他生命周期方法。

**当**组件更新时，任何通常会触发更新的更改都**不会再安排新的更新**。这样做是为了在更新过程中可以计算属性值。

#### shouldUpdate() {#shouldupdate}

调用该方法确定是否需要执行更新。

| | |
|-|-|
| 参数 | `changedProperties`：是一个`Map`，map 的键是被更改的属性（property）名称，值是更改前的属性值。
| 是否触发更新 | 不触发。在该方法内部更改的属性（property）不会触发元素更新。|
| 是否需要调用 super | 不需要。 |
| 是否支持服务端调用 | 不支持。 |

如果 `shouldUpdate()` 返回 `true`（默认返回`true`），则更新会正常进行。如果返回 `false`，则不会调用更新周期的其余部分，但 `updateComplete` promise 仍然会 resolve。

你可以自己实现 `shouldUpdate()` 来指定哪些属性更改应该触发更新。在自己的实现中，可以使用 `changedProperties` map 来比较当前值和以前的值。

```js
shouldUpdate(changedProperties) {
  // 只有prop1被更改了才会更新元素
  return changedProperties.has('prop1');
}
```

#### willUpdate() {#willupdate}

在 `update()` 之前调用该方法来计算更新期间所需的值。

| | |
|-|-|
| 参数 |  `changedProperties`：是一个`Map`，map 的键是被更改的属性（property）名称，值是更改前的属性值。 |
| 是否触发更新 | 不触发。在该方法内部更改的属性（property）不会触发元素更新。|
| 是否需要调用 super | 不需要。 |
| 是否支持服务端调用 | 支持。 |

实现 `willUpdate()` 来计算依赖于其他属性的属性值，这些属性值会在更新过程的其余部分中使用。

```js
willUpdate(changedProperties) {
  // 仅需要检查那些涉及到开销大的计算的属性
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

#### update() {#update}

调用该方法更新组件DOM。

| | |
|-|-|
| 参数 | `changedProperties`：是一个`Map`，map 的键是被更改的属性（property）名称，值是更改前的属性值。|
| 是否触发更新 | 不会。 在该方法内部更改的属性（property）不会触发元素更新。 |
| 是否需要调用 super | 需要。 不调用 super 的话，组件的属性（attribute）和模板都不会被更新。 |
| 是否支持服务端调用 | 支持。 |

反射 property 的值到 attribute 上，并且调用 `render()` 方法更新组件的内部 DOM。

通常情况下，你不需要实现该方法。

#### render() {#render}

该方法会被 `update()` 方法调用，你应该自己实现该方法，并且返回一个可渲染的结果（例如返回一个 `TemplateResult` 类型值）用于渲染组件的 DOM。

| | |
|-|-|
| 参数 | 无。 |
| 是否触发更新 | 不会。 在该方法内部更改的属性（property）不会触发元素更新。 |
| 是否需要调用 super | 不需要。|
| 是否支持服务端调用 | 支持。 |

`render()` 方法没有参数，但是通常情况下它会直接引用组件的属性。请参阅 [渲染]({{baseurl}}/docs/components/rendering/) 了解更多信息。

```js
render() {
  const header = `<header>${this.header}</header>`;
  const content = `<section>${this.content}</section>`;
  return html`${header}${content}`;
}
```

### 完成更新 {#reactive-update-cycle-completing}

调用 `update()` 将更改渲染到组件的 DOM 之后，你可以在下面这些方法中执行一些组件 DOM 相关的操作。

#### firstUpdated() {#firstupdated}

组件的 DOM 第一次被更新之后会被立即调用，该方法的调用发生在 [`updated()`](#updated) 调用之前。

| | |
|-|-|
| 参数 | `changedProperties`：是一个`Map`，map的键是被更改的属性（property）名称，值是更改前的属性值。|
| 是否触发更新 | 不会。 在该方法内部更改的属性（property）不会触发元素更新。 |
| 是否需要调用 super | 不需要。|
| 是否支持服务端调用 | 不支持。 |

实现 `firstUpdated()` 在组件的 DOM 创建后执行一些一次性的工作。可能的场景包括：聚焦到特定渲染元素，添加 [ResizeObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver) 或 [IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver) 到一个元素。

```js
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

#### updated() {#updated}

每当组件更新完成并且元素的 DOM 已更新和渲染时调用。

| | |
|-|-|
| 参数 | `changedProperties`：是一个`Map`，map 的键是被更改的属性（property）名称，值是更改前的属性值。|
| 是否触发更新 | 会。 在该方法内部更改的属性（property）会触发元素更新。 |
| 是否需要调用 super | 不需要。|
| 是否支持服务端调用 | 不支持。 |

实现 `updated()` 在更新后执行一些使用元素 DOM 的任务。例如：执行动画的代码可能需要测量元素 DOM。

```js
updated(changedProperties) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

#### updateComplete {#updatecomplete}

元素完成更新后，`updateComplete` promise 会被 resolve。所以可以使用 `updateComplete` 来等待更新完成。resolve 的值是一个 Boolean 类型的值，表示元素是否已经完成更新。如果更新周期完成后，没有挂起的更新就会 resolve 为 `true`。

渲染完成后从组件分发事件是一种很好的做法，这样做可以让事件监听器看到组件的完全渲染状态。为此，你可以在等待 `updateComplete` promise 被 resolve 之后触发事件。

```js
async _loginClickHandler() {
  this.loggedIn = true;
  // 等待 `loggedIn` 被渲染到 DOM 上
  await this.updateComplete;
  this.dispatchEvent(new Event('login'));
}
```

此外，在编写测试时，你可以在等待 `updateComplete` promise 被 resolve 之后对组件的 DOM 进行断言。

### 实现更多的定制化 {#reactive-update-cycle-customizing}

#### performUpdate()  {#performupdate}

该方法可以实现响应式更新周期，调用其他方法，如 `shouldUpdate()`、`update()` 和 `updated()`。

调用 `performUpdate()` 方法能够立即处理挂起的更新。这通常不需要，但在需要同步更新的极少数情况下可以这样做。

实现 `performUpdate()` 来自定义更新周期的时间。这对于实现自定义调度很有用。注意，如果 `performUpdate()` 返回一个 promise，`updateComplete` promise 将等待它完成。

```js
async performUpdate() {
   await new Promise((resolve) => setTimeout(() => resolve()));
   return super.performUpdate();
}
```

在该例子中，执行更新发生在绘制完成之后。该技术可用于解除对主渲染/事件线程的阻塞。请参阅 Justin Fagnani 在 Chrome 开发者峰会上的演讲-[The Virtue of Laziness](https://www.youtube.com/watch?v=ypPRdtjGooc)，了解更多讨论。

#### hasUpdated  {#hasupdated}

如果组件至少更新了一次，则 `hasUpdated` 属性返回 true。仅当组件尚未更新时，你才可以在任何生命周期方法中使用 `hasUpdated` 来执行任务。

#### getUpdateComplete() {#getUpdateComplete}

可以覆盖 `getUpdateComplete()` 方法来实现在 `updateComplete` promise fulfill 之前等待其他条件完成。例如，等待子元素的更新可能很有用。首先等待 `super.getUpdateComplete()`，然后是任何后续状态。

<div class="alert alert-info">

建议重写 `getUpdateComplete()` 方法而不是使用 `updateComplete` getter，这样可以确保与使用 TypeScript ES5 （编译）输出的用户兼容（请参阅 [TypeScript#338](https://github.com/microsoft/TypeScript/issues/338))。

</div>

```js
class MyElement extends LitElement {
  async getUpdateComplete() {
    await super.getUpdateComplete();
    await this._myChild.updateComplete;
  }
}
```

## 外部生命周期钩子: 控制器和装饰器

除了实现生命周期回调的组件类之外，外部代码可能也需要挂钩到组件的生命周期，例如 [装饰器]({{baseurl}}/docs/components/decorators/) 。

Lit 提供两种将外部代码集成到响应式生命周期的机制：`static addInitializer()` and `addController()`:

#### static addInitializer() {#addInitializer}

`addInitializer()` 允许有权访问 Lit 类定义的代码在构造类的实例时运行。

这在编写自定义装饰器时非常有用。装饰器在类定义时运行，可以做一些事情，比如：替换字段和方法定义。如果在创建实例时它们还需要工作，那么装饰器必须调用 `addInitializer()`。通常使用它来添加 [响应式控制器]({{baseurl}}/docs/composition/controllers/) 以便装饰器可以挂钩到组件生命周期：

{% switchable-sample %}

```ts
// TypeScript 装饰器
const myDecorator = (proto: ReactiveElement, key: string) => {
  const ctor = proto.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    // 这行代码将在构造元素时执行
    new MyController(instance);
  });
};
```

```js
// A Babel "Stage 2" decorator
const myDecorator = (descriptor) => {
  ...descriptor,
  finisher(ctor) {
    ctor.addInitializer((instance) => {
      // 这行代码将在构造元素时执行
      new MyController(instance);
    });
  },
};
```

{% endswitchable-sample %}

装饰字段将导致每个实例都会运行一次 initializer 添加一个控制器：

```ts
class MyElement extends LitElement {
  @myDecorator foo;
}
```

Initializer 是按构造函数存储的。添加到子类的 Initializer 不会将被添加到父类。由于 Initializer 是在构造函数中运行，所以它们将按照类层次结构的顺序运行，从父类开始，才到实例的类。

#### addController() {#addController}

`addController()` 将响应式控制器添加到 Lit 组件，以便组件调用控制器的生命周期回调。请参阅 [响应式控制器]({{baseurl}}/docs/composition/controllers/)了解更多信息。

#### removeController() {#removeController}

`removeController()` 移除了一个响应式控制器，因此它不再接收来自该组件的生命周期回调。

## 服务端响应式更新周期 {#server-reactive-update-cycle}

<div class="alert alert-info">

Lit 的服务器端渲染代码目前处于实验阶段，因此以下信息可能会发生变化。

</div>

在服务器上渲染 Lit 时，并不是所有的更新周期都会被调用。在服务器上可以调用以下方法。

<img class="centered-image" src="/images/docs/components/update-server.jpg">

<p><!-- Add some space --></p>
