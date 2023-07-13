---
title: Lifecycle
eleventyNavigation:
  key: Lifecycle
  parent: Components
  order: 5
versionLinks:
  v1: components/lifecycle/
  v2: components/lifecycle/
---

Lit components use the standard custom element lifecycle methods. In addition Lit introduces a reactive update cycle that renders changes to DOM when reactive properties change.

## Standard custom element lifecycle { #custom-element-lifecycle }
Lit components are standard custom elements and inherit the custom element lifecycle methods. For information about the custom element lifecycle, see [Using the lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) on MDN.

<div class="alert alert-info">

If you need to customize any of the standard custom element lifecycle methods, make sure to call the `super` implementation (such as `super.connectedCallback()`) so the standard Lit functionality is maintained.

</div>

### constructor() {#constructor}

Called when an element is created. Also, it’s invoked when an existing element is upgraded, which happens when the definition for a custom element is loaded after the element is already in the DOM.

#### Lit behavior

Requests an asynchronous update using the `requestUpdate()` method, so when a Lit component gets upgraded, it performs an update immediately.

Saves any properties already set on the element. This ensures values set before upgrade are maintained and correctly override defaults set by the component.

#### Use cases

Perform one time initialization tasks that must be done before the first [update](#reactive-update-cycle). For example, when not using decorators, default values for properties can be set in the constructor, as shown in [Declaring properties in a static properties field](/docs/v3/components/properties/#declaring-properties-in-a-static-properties-field).

```js
constructor() {
  super();
  this.foo = 'foo';
  this.bar = 'bar';
}
```
### connectedCallback() {#connectedcallback}

Invoked when a component is added to the document's DOM.

#### Lit behavior

Lit initiates the first element update cycle after the element is connected. In preparation for rendering, Lit also ensures the `renderRoot` (typically, its `shadowRoot`) is created.

Once an element has connected to the document at least once, component updates will proceed regardless of the connection state of the element.

#### Use cases

In `connectedCallback()` you should setup tasks that should only occur when the element is connected to the document. The most common of these is adding event listeners to nodes external to the element, like a keydown event handler added to the window. Typically, anything done in `connectedCallback()` should be undone when the element is disconnected — for example, removing event listeners on window to prevent memory leaks.

```js
connectedCallback() {
  super.connectedCallback()
  addEventListener('keydown', this._handleKeydown);
}
```
### disconnectedCallback() {#disconnectedcallback}

Invoked when a component is removed from the document's DOM.

#### Lit behavior

Pauses the [reactive update cycle](#reactive-update-cycle). It is resumed when the element is connected.

#### Use cases

This callback is the main signal to the element that it may no longer be used; as such, `disconnectedCallback()` should ensure that nothing is holding a reference to the element (such as event listeners added to nodes external to the element), so that it is free to be garbage collected. Because elements may be re-connected after being disconnected, as in the case of an element moving in the DOM or caching, any such references or listeners may need to be re-established via `connectedCallback()` so that the element continues functioning as expected in these scenarios. For example, remove event listeners to nodes external to the element, like a keydown event handler added to the window.

```js
disconnectedCallback() {
  super.disconnectedCallback()
  window.removeEventListener('keydown', this._handleKeydown);
}
```

<div class="alert alert-info">

**No need to remove internal event listeners.** You don't need to remove event listeners added on the component's own DOM—including those added declaratively in your template. Unlike external event listeners, these won't prevent the component from being garbage collected.

</div>

### attributeChangedCallback() { %attributeChangedCallback }

Invoked when one of the element’s `observedAttributes` changes.

#### Lit behavior

Lit uses this callback to sync changes in attributes to reactive properties. Specifically, when an attribute is set, the corresponding property is set. Lit also automatically sets up the element’s `observedAttributes` array to match the component’s list of reactive properties.

#### Use cases

You rarely need to implement this callback.

### adoptedCallback() {#adoptedcallback}

Invoked when a component is moved to a new document.

<div class="alert alert-info">

Be aware that `adoptedCallback` is not polyfilled.

</div>

#### Lit behavior

Lit has no default behavior for this callback.

#### Use cases

This callback should only be used for advanced use cases when the element behavior should change when it changes documents.

## Reactive update cycle { #reactive-update-cycle }

In addition to the standard custom element lifecycle, Lit components also implement a reactive update cycle.

The reactive update cycle is triggered when a reactive property changes or when the `requestUpdate()` method is explicitly called. Lit performs updates asynchronously so property changes are batched — if more properties change after an update is requested, but before the update starts, all of the changes are captured in the same update.

Updates happen at microtask timing, which means they occur before the browser paints the next frame to the screen. See [Jake Archibald's article](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) on microtasks for more information about browser timing.

At a high level, the reactive update cycle is:

1. An update is scheduled when one or more properties change or when `requestUpdate()` is called.
1. The update is performed prior to the next frame being painted.
    1. Reflecting attributes are set.
    1. The component’s render method is called to update its internal DOM.
1. The update is completed and the `updateComplete` promise is resolved.

In more detail, it looks like this:

**Pre-Update**

<img class="centered-image" src="/images/docs/components/update-1.jpg">

<p><img class="centered-image" src="/images/docs/components/update-2.jpg"></p>

**Update**

<img class="centered-image" src="/images/docs/components/update-3.jpg">

**Post-Update**

<img class="centered-image" src="/images/docs/components/update-4.jpg">

### The changedProperties map {#changed-properties}

Many reactive update methods receive a `Map` of changed properties. The `Map` keys are the property names and its values are the **previous** property values. You can always find the current property values using <code>this.<var>property</var></code> or <code>this[<var>property</var>]</code>.

#### TypeScript types for changedProperties

If you're using TypeScript and you want strong type checking for the `changedProperties` map, you can use `PropertyValues<this>`, which infers the correct type for each property name. 

```ts
import {LitElement, html, PropertyValues} from 'lit';
...
  shouldUpdate(changedProperties: PropertyValues<this>) {
    ...
  }
```

If you're less concerned with strong typing—or you're only checking the property names, not the previous values—you could use a less restrictive type like `Map<string, any>`.

Note that `PropertyValues<this>` doesn't recognize `protected` or `private` properties. If you're checking any `protected` or `private` properties, you'll need to use a less restrictive type.

#### Changing properties during an update {#changing-properties-during-an-update}

Changing a property *during* the update  (up to and including the `render()` method) updates the `changedProperties` map, but **doesn't** trigger a new update. Changing a property _after_ `render()` (for example, in the `updated()` method) triggers a new update cycle, and the changed property is added to a new `changedProperties` map to be used for the next cycle.

### Triggering an update {#reactive-update-cycle-triggering}

An update is triggered when a reactive property changes or the `requestUpdate()` method is called. Since updates are performed asynchronously, any and all changes that occur before the update is performed result in only a **single update**.

#### hasChanged() {#haschanged}

Called when a reactive property is set. By default `hasChanged()` does a strict equality check and if it returns `true`, an update is scheduled. See [configuring `hasChanged()`](/docs/v3/components/properties/#haschanged) for more information.

#### requestUpdate() {#requestUpdate}

Call `requestUpdate()` to schedule an explicit update. This can be useful if you need the element to update and render when something not related to a property changes. For example, a timer component might call `requestUpdate()` every second.

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

The list of properties that have changed is stored in a `changedProperties` map that’s passed to subsequent lifecycle methods. The map keys are the property names and its values are the previous property values.

Optionally, you can pass a property name and a previous value when calling `requestUpdate()`, which will be stored in the `changedProperties` map. This can be useful if you implement a custom getter and setter for a property. See [Reactive properties](/docs/v3/components/properties/) for more information about implementing custom getters and setters.

```js
  this.requestUpdate('state', this._previousState);
```

### Performing an update {#reactive-update-cycle-performing}

When an update is performed, the `performUpdate()` method is called. This method calls a number of other lifecycle methods.

Any changes that would normally trigger an update which occur **while** a component is updating do **not schedule a new update**. This is done so that property values can be computed during the update process. Properties changed during the update **are reflected in the `changedProperties` map**, so subsequent lifecycle methods can act on the changes.

#### shouldUpdate() {#shouldupdate}

Called to determine whether an update cycle is required.

| | |
|-|-|
| Arguments | `changedProperties`: `Map` with keys that are the names of changed properties and  values that are the corresponding previous values. |
| Updates | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | No. |

If `shouldUpdate()` returns `true`, which it does by default, then the update proceeds normally. If it returns `false`, the rest of the update cycle will not be called but the `updateComplete` Promise is still resolved.

You can implement `shouldUpdate()` to specify which property changes should cause updates. Use the map of `changedProperties` to compare current and previous values.

{% switchable-sample %}

```ts
shouldUpdate(changedProperties: Map<string, any>) {
  // Only update element if prop1 changed.
  return changedProperties.has('prop1'); 
}
```

```js
shouldUpdate(changedProperties) {
  // Only update element if prop1 changed.
  return changedProperties.has('prop1');
}
```

{% endswitchable-sample %}

#### willUpdate() {#willupdate}

Called before `update()` to compute values needed during the update.

| | |
|-|-|
| Arguments |  `changedProperties`: `Map` with keys that are the names of changed properties and values that are the corresponding previous values. |
| Updates? | No. Property changes inside this method do not trigger an element update. |
| Call super? | Not necessary. |
| Called on server? | Yes. |

Implement `willUpdate()` to compute property values that depend on other properties and are used in the rest of the update process.

{% switchable-sample %}

```ts
willUpdate(changedProperties: PropertyValues<this>) {
  // only need to check changed properties for an expensive computation.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

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

{% endswitchable-sample %}

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

The `render()` method has no arguments, but typically it references component properties. See [Rendering](/docs/v3/components/rendering/) for more information.

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

{% switchable-sample %}

```ts
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

```js
updated(changedProperties) {
  if (changedProperties.has('collapsed')) {
    this._measureDOM();
  }
}
```

{% endswitchable-sample %}

#### updateComplete {#updatecomplete}

The `updateComplete` promise resolves when the element has finished updating. Use `updateComplete` to wait for an update. The resolved value is a boolean indicating if the element has finished updating. It will be `true` if there are no pending updates after the update cycle has finished.

When an element updates, it may cause its children to update as well. By default, the `updateComplete` promise resolves when the element's update has completed, but does not wait for any children to have completed their updates. This behavior may be customized by overriding [`getUpdateComplete`](#getUpdateComplete).

There are several use cases for needing to know when an element's update has completed:

1. **Tests** When writing tests you can await the `updateComplete` promise before making assertions about a component’s DOM. If the assertions depend on updates completing for the component's entire descendant tree, awaiting `requestAnimationFrame` is often a better choice, since Lit's default scheduling uses the browser's microtask queue, which is emptied prior to animation frames. This ensures all pending Lit updates on the page have completed before the `requestAnimationFrame` callback.

2. **Measurement** Some components may need to measure DOM in order to implement certain layouts. While it is always better to implement layouts using pure CSS rather than JavaScript-based measurement, sometimes CSS limitations make this unavoidable. In very simple cases, and if you're measuring Lit or ReactiveElement components, it may be sufficient to await `updateComplete` after state changes and before measuring. However, because `updateComplete` does not await the update of all descendants, we recommend using [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) as a more robust way to trigger measurement code when layouts change.

3. **Events** It is a good practice to dispatch events from components after rendering has completed, so that the event's listeners see the fully rendered state of the component. To do so, you can await the `updateComplete` promise before firing the event.

    ```js
    async _loginClickHandler() {
      this.loggedIn = true;
      // Wait for `loggedIn` state to be rendered to the DOM
      await this.updateComplete;
      this.dispatchEvent(new Event('login'));
    }
    ```

The `updateComplete` promise rejects if there's an unhandled error during the update cycle. For more information, see [Handling errors in the update cycle](#errors-in-the-update-cycle).

### Handling errors in the update cycle {#errors-in-the-update-cycle}

If you have an uncaught exception in a lifecycle method like `render()` or `update()`, it  causes the `updateComplete` promise to reject.
If you have code in a lifecycle method that can throw an exception, it's good practice to put it inside a `try`/`catch` statement.

You may also want to use a `try`/`catch` if you're awaiting the `updateComplete` promise:

```js
try {
  await this.updateComplete;
} catch (e) {
  /* handle error */
}
```

In some cases, code may throw in unexpected places. As a fallback, you can add a handler for `window.onunhandledrejection` to catch these issues. For example, you could use this report errors back to a backend service to help diagnose issues that are hard to reproduce.

```js
window.onunhandledrejection = function(e) {
  /* handle error */
}
```

### Implementing additional customization {#reactive-update-cycle-customizing}

This section covers some less-common methods for customizing the update cycle.

#### scheduleUpdate() {#scheduleupdate}

Override `scheduleUpdate()` to customize the timing of the update. `scheduleUpdate()` is called when an update is about to be performed, and by default it calls `performUpdate()` immediately. Override it to defer the update—this technique can be used to unblock the main rendering/event thread. 

For example, the following code schedules the update to occur after the next frame paints, which can reduce jank if the update is expensive:

{% switchable-sample %}

```ts
protected override async scheduleUpdate(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  super.scheduleUpdate();
}
```

```js
async scheduleUpdate() {
  await new Promise((resolve) => setTimeout(resolve));
  super.scheduleUpdate();
}
```

{% endswitchable-sample %}

If you override `scheduleUpdate()`, it's your responsibility to call `super.scheduleUpdate()` to perform the pending update.

{% aside "info" %}

Async function optional.

This example shows an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) which _implicitly_ returns a promise. You can also write `scheduleUpdate()` as a function that _explictly_ returns a `Promise`. In either case, the **next** update doesn't start until the promise returned by `scheduleUpdate()` resolves. 

{% endaside %}


#### performUpdate()  {#performupdate}

Implements the reactive update cycle, calling the other methods, like `shouldUpdate()`, `update()`, and `updated()`.

Call `performUpdate()` to immediately process a pending update. This should generally not be needed, but it can be done in rare cases when you need to update synchronously. (If there is no update pending, you can call `requestUpdate()` followed by `performUpdate()` to force a synchronous update.)

{% aside "info" %}

Use `scheduleUpdate()` to customize scheduling.

If you want to customize how updates are scheduled, override `scheduleUpdate()`. Previously, we recommended overriding `performUpdate()` for this purpose. That continues to work, but it makes it more difficult to call `performUpdate()` to process a pending update synchronously. 

{% endaside %}

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

In addition to component classes implementing lifecycle callbacks, external code, such as [decorators](/docs/v3/components/decorators/) may need to hook into a component's lifecycle.

Lit offers two concepts for external code to integrate with the reactive update lifecycle: `static addInitializer()` and `addController()`:

#### static addInitializer() {#addInitializer}

`addInitializer()` allows code that has access to a Lit class definition to run code when instances of the class are constructed.

This is very useful when writing custom decorators. Decorators are run at class definition time, and can do things like replace field and method definitions. If they also need to do work when an instance is created, they must call `addInitializer()`. It will be common to use this to add a [reactive controller](/docs/v3/composition/controllers/) so decorators can hook into the component lifecycle:

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

`addController()` adds a reactive controller to a Lit component so that the component invokes the controller's lifecycle callbacks. See the [Reactive Controller](/docs/v3/composition/controllers/) docs for more information.

#### removeController() {#removeController}

`removeController()` removes a reactive controller so it no longer receives lifecycle callbacks from this component.

## Server-side reactive update cycle {#server-reactive-update-cycle}

<div class="alert alert-info">

Lit's [server-side rendering package](/docs/v3/ssr/overview/) is currently under active development so the following information is subject to change.

</div>

Not all of the update cycle is called when rendering Lit on the server. The following methods are called on the server.

<img class="centered-image" src="/images/docs/components/update-server.jpg">

<p><!-- Add some space --></p>
