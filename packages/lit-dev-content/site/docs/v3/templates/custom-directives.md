---
title: Custom directives
eleventyNavigation:
  parent: Templates
  title: Custom directives
  key: Custom directives
  order: 6
versionLinks:
  v1: lit-html/creating-directives/
  v2: templates/custom-directives/
---

Directives are functions that can extend Lit by customizing how a template expression renders. Directives are useful and powerful because they can be stateful, access the DOM, be notified when templates are disconnected and reconnected, and independently update expressions outside of a render call.

Using a directive in your template is as simple as calling a function in a template expression:

```js
html`<div>
       ${fancyDirective('some text')}
     </div>`
```

Lit ships with a number of [built-in directives](/docs/v3/templates/directives/) like [`repeat()`](/docs/v3/templates/directives/#repeat) and [`cache()`](/docs/v3/templates/directives/#cache). Users can also write their own custom directives.

There are two kinds of directives:

-   Simple functions
-   Class-based directives

A simple function returns a value to render. It can take any number of arguments, or no arguments at all.

```js
export noVowels = (str) => str.replaceAll(/[aeiou]/ig,'x');
```

A class-based directive lets you do things that a simple function can't. Use a class based directive to:

-   Access the rendered DOM directly (for example, add, remove, or reorder rendered DOM nodes).
-   Persist state between renders.
-   Update the DOM asynchronously, outside of a render call.
-   Clean up resources when the directive is disconnected from the DOM

The rest of this page describes class-based directives.

## Creating class-based directives

To create a class-based directive:

*   Implement the directive as a class that extends the {% api-v3 "Directive" %} class.
*   Pass your class to the {% api-v3 "directive()" "directive" %} factory to create a directive function that can be used in Lit template expressions.

```js
import {Directive, directive} from 'lit/directive.js';

// Define directive
class HelloDirective extends Directive {
  render() {
    return `Hello!`;
  }
}
// Create the directive function
const hello = directive(HelloDirective);

// Use directive
const template = html`<div>${hello()}</div>`;
```

When this template is evaluated, the directive _function_  (`hello()`) returns a `DirectiveResult` object, which instructs Lit to create or update an instance of the directive _class_ (`HelloDirective`). Lit then calls methods on the directive instance to run its update logic.

Some directives need to update the DOM asynchronously, outside of the normal update cycle. To create an _async directive_, extend the `AsyncDirective` base class instead of `Directive`. See [Async directives](#async-directives) for details.

## Lifecycle of a class-based directive

The directive class has a few built-in lifecycle methods:

*  The class constructor, for one-time initialization.
*  `render()`, for declarative rendering.
*  `update()`, for imperative DOM access.

You must implement the `render()` callback for all directives. Implementing `update()` is optional. The default implementation of `update()` calls and returns the value from `render()`.

Async directives, which can update the DOM outside of the normal update cycle, use some additional lifecycle callbacks. See [Async directives](#async-directives) for details.

### One-time setup: constructor()

When Lit encounters a `DirectiveResult` in an expression for the first time, it will construct an instance of the corresponding directive class (causing the directive's constructor and any class field initializers to run):

{% switchable-sample %}

```ts
class MyDirective extends Directive {
  // Class fields will be initialized once and can be used to persist
  // state between renders
  value = 0;
  // Constructor is only run the first time a given directive is used
  // in an expression
  constructor(partInfo: PartInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

```js
class MyDirective extends Directive {
  // Class fields will be initialized once and can be used to persist
  // state between renders
  value = 0;
  // Constructor is only run the first time a given directive is used
  // in an expression
  constructor(partInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

{% endswitchable-sample %}

As long as the same directive function is used in the same expression each render, the previous instance is reused, thus the state of the instance persists between renders.

The constructor receives a single `PartInfo` object, which provides metadata about the expression the directive was used in. This can be useful for providing error checking in the cases where a directive is designed to be used only in specific types of expressions (see [Limiting a directive to one expression type](#limiting-a-directive-to-one-expression-type)).

### Declarative rendering: render()

The `render()` method should return the value to render into the DOM. It can return any renderable value, including another `DirectiveResult`.

In addition to referring to state on the directive instance, the `render()` method can also accept arbitrary arguments passed in to the directive function:

```js
const template = html`<div>${myDirective(name, rank)}</div>`
```

The parameters defined for the `render()` method determine the signature of the directive function:

{% switchable-sample %}

```ts
class MaxDirective extends Directive {
  maxValue = Number.MIN_VALUE;
  // Define a render method, which may accept arguments:
  render(value: number, minValue = Number.MIN_VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// Call the directive with `value` and `minValue` arguments defined for `render()`:
const template = html`<div>${max(someNumber, 0)}</div>`;
```

```js
class MaxDirective extends Directive {
  maxValue = Number.MIN_VALUE;
  // Define a render method, which may accept arguments:
  render(value, minValue = Number.MIN_VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// Call the directive with `value` and `minValue` arguments defined for `render()`:
const template = html`<div>${max(someNumber, 0)}</div>`;
```

{% endswitchable-sample %}

### Imperative DOM access: update()

In more advanced use cases, your directive may need to access the underlying DOM and imperatively read from or mutate it. You can achieve this by overriding the `update()` callback.

The `update()` callback receives two arguments:

*   A `Part` object with an API for directly managing the DOM associated with the expression.
*   An array containing the `render()` arguments.

Your `update()` method should return something Lit can render, or the special value `noChange` if no re-rendering is required. The `update()` callback is quite flexible, but typical uses include:

- Reading data from the DOM, and using it to generate a value to render.
- Imperatively updating the DOM using the `element` or `parentNode` reference on the `Part` object. In this case, `update()` usually returns `noChange`, indicating that Lit doesn't need to take any further action to render the directive.

#### Parts

Each expression position has its own specific `Part` object:

*   {% api-v3 "ChildPart" %} for expressions in HTML child position.
*   {% api-v3 "AttributePart" %} for expressions in HTML attribute value position.
*   {% api-v3 "BooleanAttributePart" %} for expressions in a boolean attribute value (name prefixed with `?`).
*   {% api-v3 "EventPart" %} for expressions in an event listener position (name prefixed with `@`).
*   {% api-v3 "PropertyPart" %} for expressions in property value position (name prefixed with `.`).
*   {% api-v3 "ElementPart" %} for expressions on the element tag.

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

To update a directive's result asynchronously, a directive needs to extend the {% api-v3 "AsyncDirective" %} base class, which provides a `setValue()` API. `setValue()` allows a directive to "push" a new value into its template expression, outside of the template's normal `update`/`render` cycle.

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

Here, the rendered template shows "Waiting for promise to resolve", followed by the resolved value of the promise, whenever it resolves.

Async directives often need to subscribe to external resources. To prevent memory leaks, async directives should unsubscribe or dispose of resources when the directive instance is no longer in use.  For this purpose, `AsyncDirective` provides the following extra lifecycle callbacks and API:

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
