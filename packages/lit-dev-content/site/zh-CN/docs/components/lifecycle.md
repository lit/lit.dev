---
title: 生命周期
eleventyNavigation:
  key: 生命周期
  parent: 组件
  order: 5
versionLinks:
  v1: components/lifecycle/
---

Lit组件使用标准的自定义元素生命周期方法。 此外，Lit还引入了一个响应式更新周期，当响应式属性发生变化时，它会将更改呈现到DOM上。  

## 标准自定义元素生命周期 { #custom-element-lifecycle }

Lit组件是标准的自定义元素，并继承了自定义元素的生命周期方法。 请查看MDN上的 [使用生命周期回调](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_custom_elements#%E4%BD%BF%E7%94%A8%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0) 了解更多有关自定义元素生命周期的信息。  

<div class="alert alert-info">

如果你需要定制任何标准的自定义元素生命周期方法，请确保调用 `super` 上的实现(例如 `super.connectedcallback()`)，这样就可以保持Lit的标准功能。  

</div>

### constructor() {#constructor}

创建元素时调用。 此外，当现有元素升级时也会调用它，如果一个自定义元素已经存在于DOM中，然后关于它的定义又被重新加载，就会触发元素升级。

#### Lit behavior 

Requests an asynchronous update using the `requestUpdate()` method, so when a Lit component gets upgraded, it performs an update immediately.
使用 `requestUpdate()` 方法请求异步更新，因此当 Lit 组件升级时，它会立即执行更新。

保存已在元素上设置的任何属性（property）。这可确保组件升级前设置的值被保留下来，并正确覆盖组件设置的默认值。

#### Use cases

Perform one time initialization tasks that must be done before the first [update](#reactive-update-cycle). For example, when not using decorators, default values for properties can be set in the constructor, as shown in [Declaring properties in a static properties field](/docs/components/properties/#declaring-properties-in-a-static-properties-field).

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

Lit 在元素连接后启动第一个元素更新周期。在准备渲染时，Lit 还确保创建了`renderRoot`（通常是组件的`shadowRoot`）。

一旦一个元素连接到文档，哪怕只有一次，之后无论元素的连接状态如何，组件更新都会继续进行。

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

This callback is the main signal to the element that it may no longer be used; as such, `disconnectedCallback()` should ensure that nothing is holding a reference to the element (such as event listeners added to nodes external to the element), so that it is free to be garbage collected. Because elements may be re-connected after being disconnected, as in the case of an element moving in the DOM or caching, any such references or listeners may need to be re-established via `connectedCallback()` so that the element continues functioning as expected in these scenarios. For example, remove event listeners to nodes external to the element, like a keydown event handler added to the window.

这个回调是元素的一个主要信号：它可能不再被使用了；因此，应该在 `disconnectedCallback()` 中确保没有任何东西持有对该元素的引用（例如：添加到元素外部节点的事件监听器），以便它可以被垃圾回收机制自由地回收。因为元素可能在断开连接后重新连接，例如元素在 DOM 中移动或缓存的情况，任何此类引用或监听器都可能需要通过 `connectedCallback()` 重新建立，以便元素在这种情况下可以继续按预期运行。例如删除元素外部节点的事件侦听器，例如添加到窗口的 keydown 事件处理程序。

```js
disconnectedCallback() {
  super.disconnectedCallback()
  window.removeEventListener('keydown', this._handleKeydown);
}
```

<div class="alert alert-info">

**没必要移除内部事件监听器。** 您不需要移除添加到组件自己的 DOM 上的事件监听器——包括那些以声明方式添加到你的模板中的事件监听器。与外部事件监听器不同，内部事件监听器不会阻止组件被垃圾回收机制回收。

</div>

### attributeChangedCallback() { %attributeChangedCallback }

元素的任何一个 `observedAttributes` 更改时调用。

#### Lit 行为

Lit 使用该回调将attribute的更改同步到响应式属性。具体来说，当设置了一个attribute时，就设置了相应的property。 Lit 还会自动设置元素的 `observedAttributes` 数组以匹配组件的响应式属性列表。

#### Use cases

你很少需要实现这个回调。

### adoptedCallback() {#adoptedcallback}

当组件移动到新的文档（document）时调用。

<div class="alert alert-info">

Be aware that `adoptedCallback` is not polyfilled.

请注意，`adoptedCallback` 不是 polyfill。

</div>

#### Lit 行为

Lit 没有针对这个回调的默认行为。

#### 用例

此回调应仅用于高级用例，即元素行为应在更改文档时发生更改。

## 响应式更新周期 { #reactive-update-cycle }

除了标准的自定义元素生命周期之外，Lit 组件还实现了响应式式更新周期。

当响应式属性被更改或显式调用 `requestUpdate()` 方法时，会触发响应式更新周期。 Lit 执行更新是异步的，因此属性更改是批处理的——如果在请求更新后但在更新开始之前有更多属性被更改，则所有更改都会在同一个更新中捕获。

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

当响应式属性被更改或调用 `requestUpdate()` 方法时会触发更新。由于更新是异步执行的，因此在执行更新之前发生的任何（所有）更改都只会导致**一次更新**。

#### hasChanged() {#haschanged}

Called when a reactive property is set. By default `hasChanged()` does a strict equality check and if it returns `true`, an update is scheduled. See [configuring `hasChanged()`](/docs/components/properties/#haschanged) for more information.

在设置反应属性时调用。默认情况下，`hasChanged()` 会进行严格相等比较，如果返回 `true`，则会安排更新。请参阅 [配置 `hasChanged()`](/docs/components/properties/#haschanged)了解更多详细信息。

#### requestUpdate() {#requestUpdate}

调用 `requestUpdate()` 来安排显式更新。如果你需要在与属性无关的内容发生更改时更新和渲染元素，这将很有用。例如，计时器组件可能每秒调用一次`requestUpdate()`。

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

被更改的属性（property）列表存储一个 map 中，然后将该Map传递给所有后续生命周期方法。 map 的键是属性名称，值是更改前的属性值。

或者，你可以在调用 `requestUpdate()` 时传递属性名称和更新前的值，这些值将存储在 `changedProperties` map中。如果你要为属性实现自定义 getter 和 setter，这将很有用。请参阅 [响应式属性]({{baseurl}}/docs/components/properties/)了解更多有关实现自定义 getter 和 setter 的信息。

```js
  this.requestUpdate('state', this._previousState);
```

### 执行更新 {#reactive-update-cycle-performing}

执行更新时，会调用 `performUpdate()` 方法。该方法会调用许多其他生命周期方法。

**当**组件更新时，任何通常会触发更新的更改都**不会安排新的更新**。这样做是为了在更新过程中可以计算属性值。

#### shouldUpdate() {#shouldupdate}

调用该方法确定是否需要执行更新。

| | |
|-|-|
| 参数 | `changedProperties`: 是一个`Map`，map的键是被更改的属性（property）名称，值是更改前的属性值。
| 是否更新 | 不更新。 在该方法内部更改的属性（property）不会触发元素更新。|
| 是否调用 super? | 不需要。 |
| 是否服务端调用? | 不是。 |

如果 `shouldUpdate()` 返回 `true`（默认返回`true`），则更新会正常进行。如果返回 `false`，则不会调用更新周期的其余部分，但 `updateComplete` Promise 仍然会resolve。

你可以自己实现 `shouldUpdate()` 来指定哪些属性更改应该触发更新。在自己的实现中，可以使用 `changedProperties` map来比较当前值和以前的值。

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
| Arguments |  `changedProperties`: `Map` with keys that are the names of changed properties and values that are the corresponding previous values. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | Yes. |

Implement `willUpdate()` to compute property values that depend on other properties and are used in the rest of the update process.

```js
willUpdate(changedProperties) {
  // only need to check changed properties for an expensive computation.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

#### update() {#update}

Called to update the component's DOM.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Yes. Without a super call, the element’s attributes and template will not update. |
| Called on server? | No. |

Reflects property values to attributes and calls `render()` to update the component’s internal DOM.

Generally, you should not need to implement this method.

#### render() {#render}

Called by `update()` and should be implemented to return a renderable result (such as a `TemplateResult`) used to render the component's DOM.

| | |
|-|-|
| Arguments | None. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | Yes. |

The `render()` method has no arguments, but typically it references component properties. See [Rendering](/docs/components/rendering/) for more information.

```js
render() {
  const header = `<header>${this.header}</header>`;
  const content = `<section>${this.content}</section>`;
  return html`${header}${content}`;
}
```

### Completing an update {#reactive-update-cycle-completing}

After `update()` is called to render changes to the component's DOM, you can perform actions on the component's DOM using these methods.

#### firstUpdated() {#firstupdated}

Called after the component's DOM has been updated the first time, immediately before [`updated()`](#updated) is called.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | Yes. Property changes inside this method schedule a new update cycle. |
| Call super? | Not necessary. |
| Called on server? | No. |

Implement `firstUpdated()` to perform one-time work after the component's DOM has been created. Some examples might include focusing a particular rendered element or adding a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) or [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) to an element.

```js
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

#### updated() {#updated}

Called whenever the component’s update finishes and the element's DOM has been updated and rendered.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates? | Yes. Property changes inside this method trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | No. |

Implement `updated()` to perform tasks that use element DOM after an update. For example, code that performs animation may need to measure the element DOM.

```js
updated(changedProperties) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

#### updateComplete {#updatecomplete}

The `updateComplete` Promise resolves when the element has finished updating. Use `updateComplete` to wait for an update. The resolved value is a Boolean indicating if the element has finished updating. It will be `true` if there are no pending updates after the update cycle has finished.

It is a good practice to dispatch events from components after rendering has completed, so that the event's listeners see the fully rendered state of the component. To do so, you can await the `updateComplete` Promise before firing the event.

```js
async _loginClickHandler() {
  this.loggedIn = true;
  // Wait for `loggedIn` state to be rendered to the DOM
  await this.updateComplete;
  this.dispatchEvent(new Event('login'));
}
```

Also, when writing tests you can await the `updateComplete` Promise before making assertions about the component’s DOM.

### Implementing additional customization {#reactive-update-cycle-customizing}

#### performUpdate()  {#performupdate}

Implements the reactive update cycle, calling the other methods, like `shouldUpdate()`, `update()`, and `updated()`.

Call `performUpdate()` to immediately process a pending update. This should generally not be needed, but it can be done in rare cases when you need to update synchronously.

Implement `performUpdate()` to customize the timing of the update cycle. This can be useful for implementing custom scheduling. Note, if `performUpdate()` returns a Promise, the `updateComplete` Promise will await it.

```js
async performUpdate() {
   await new Promise((resolve) => setTimeout(() => resolve()));
   return super.performUpdate();
}
```

In this example, the update is performed after paint. This technique can be used to unblock the main rendering/event thread. See the Chrome Dev Summit talk by Justin Fagnani [The Virtue of Laziness](https://www.youtube.com/watch?v=ypPRdtjGooc) for an extended discussion.

#### hasUpdated  {#hasupdated}

The `hasUpdated` property returns true if the component has updated at least once. You can use `hasUpdated` in any of the lifecycle methods to perform work only if the component has not yet updated.


#### getUpdateComplete() {#getUpdateComplete}

To await additional conditions before fulfilling the `updateComplete` promise, override the `getUpdateComplete()` method. For example, it may be useful to await the update of a child element. First await `super.getUpdateComplete()`, then any subsequent state.

<div class="alert alert-info">

It's recommended to override the `getUpdateComplete()` method instead of the `updateComplete` getter to ensure compatibility with users who are using TypeScript's ES5 output (see [TypeScript#338](https://github.com/microsoft/TypeScript/issues/338)).

</div>

```js
class MyElement extends LitElement {
  async getUpdateComplete() {
    await super.getUpdateComplete();
    await this._myChild.updateComplete;
  }
}
```

## External lifecycle hooks: controllers and decorators

In addition to component classes implementing lifecycle callbacks, external code, such as [decorators](/docs/components/decorators/) may need to hook into a component's lifecycle.

Lit offers two concepts for external code to integrate with the reactive update lifecycle: `static addInitializer()` and `addController()`:

#### static addInitializer() {#addInitializer}

`addInitializer()` allows code that has access to a Lit class definition to run code when instances of the class are constructed.

This is very useful when writing custom decorators. Decorators are run at class definition time, and can do things like replace field and method definitions. If they also need to do work when an instance is created, they must call `addInitializer()`. It will be common to use this to add a [reactive controller](/docs/composition/controllers/) so decorators can hook into the component lifecycle:

{% switchable-sample %}

```ts
// A TypeScript decorator
const myDecorator = (proto: ReactiveElement, key: string) => {
  const ctor = proto.constructor as typeof ReactiveElement;

  ctor.addInitializer((instance: ReactiveElement) => {
    // This is run during construction of the element
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
      // This is run during construction of the element
      new MyController(instance);
    });
  },
};
```

{% endswitchable-sample %}


Decorating a field will then cause each instance to run an initializer
that adds a controller:

```ts
class MyElement extends LitElement {
  @myDecorator foo;
}
```

Initializers are stored per-constructor. Adding an initializer to a
subclass does not add it to a superclass. Since initializers are run in
constructors, initializers will run in order of the class hierarchy,
starting with superclasses and progressing to the instance's class.

#### addController() {#addController}

`addController()` adds a reactive controller to a Lit component so that the component invokes the controller's lifecycle callbacks. See the [Reactive Controller](/docs/composition/controllers/) docs for more information.

#### removeController() {#removeController}

`removeController()` removes a reactive controller so it no longer receives lifecycle callbacks from this component.

## Server-side reactive update cycle {#server-reactive-update-cycle}

<div class="alert alert-info">

Lit’s server-side rendering code is currently in an experimental stage so the following information is subject to change.

</div>

Not all of the update cycle is called when rendering Lit on the server. The following methods are called on the server.

<img class="centered-image" src="/images/docs/components/update-server.jpg">

<p><!-- Add some space --></p>
