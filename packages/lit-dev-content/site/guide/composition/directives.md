---
title: Creating directives
eleventyNavigation:
  parent: Composition
  title: Creating directives
  key: Directives
  order: 2
---

Directives are objects that customize how Lit renders expressions. Using a directive in your template is like calling a function:

```js
html`<div>
     ${fancyDirective('some text')}
  </div>`
```

However, instead of simply _returning_ a value to render, a directive gets special access to the underlying DOM associated with its expression. And a directive instance is persisted across multiple renders so it can maintain state. A directive can even update the DOM asynchronously, outside of the main update process.

While Lit ships with a number of built-in directives like [`repeat()`](TODO_XREF) and [`cache()`](TODO_XREF), users can author their own custom directives. To create a directive:

*   Implement the directive as a class that extends the `Directive` class.
*   Pass your class to the `directive` factory to create a directive function that can be used in Lit template expressions.

```js
import {Directive, directive} from 'lit-html/directive.js';

// Define directive
class HelloDirective extends Directive {
  render() {
    return `Hello!`;
  }
}
const hello = directive(HelloDirective);

// Use directive
const template = html`<div>${hello()}</div>`;
```

When this template is evaluated, the directive _function_  (`hello()`) returns a `DirectiveResult` object, which instructs Lit to create or update an instance of the directive _class_ (`HelloDirective`). Lit then calls methods on the class instance to run its update logic.

## Lifecycle of a directive

The directive class has a few built-in lifecycle methods:

*  The class constructor, for one-time initialization.
*  `render()`, for declarative rendering.
*  `update()`, for imperative DOM manipulation.

### One-time setup: constructor()

When Lit encounters a `DirectiveResult` in an expression for the first time, it will construct an instance of the corresponding directive class (causing the directive's constructor and any class field initializers to run):

```ts
class MaxDirective extends Directive {
  // Class fields will be initialized once and can be used to persist
  // state between renders
  maxValue = 0;
  // Constructor is only run the first time a given directive is used
  // in an expression
  constructor(partInfo: PartInfo) {
    super(partInfo);
    console.log('MaxDirective created');
  }
  ...
}
```

As long as the same directive function is used in the same expression each render, the previous instance is reused, thus the state of the instance persists between renders.

The constructor receives a single `PartInfo` object, which provides metadata about the expression the directive was used in. This can be useful for providing error checking in the cases where a directive is designed to be used only in specific types of expressions (see [Limiting a directive to one expression type](#limiting-a-directive-to-one-expression-type)).

### Declarative rendering: render()

The `render()` method should return the value to render into the DOM. It can return any renderable value, including another `DirectiveResult`.

In addition to referring to state on the class instance, the `render()` method can also accept arbitrary arguments passed in to the directive function:

```js
const template = html`<div>${myDirective(name, rank)}</div>`
```

The arguments defined for the `render()` method determine the signature of the directive function:

```ts
class MaxDirective extends Directive {
  maxValue = 0;
  // Define a render method, which may optionally accept arguments:
  render(value: unknown, minValue = 0) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// Call the directive with `value` and `minValue` arguments defined for `render()`:
const template = html`<div>${max(someNumber, 0)}</div>`;
```

### Imperative DOM manipulation: update()

In more advanced use cases, the directive may need to access the underlying DOM and imperatively read from or mutate it. This can be achieved by overriding the `update()` callback.

The default implementation of `update()` simply calls and returns the value from `render()`. When you override `update()`, you can either call `render()`

In addition to the render arguments, `update()` also receives a `part` argument with an API for directly managing the DOM associated with expressions.  Each expression position has its own specific `Part` object:

*   [`ChildPart`](/api/classes/_lit_html_.childpart.html) for expressions in HTML child position.
*   [`AttributePart`](/api/classes/_lit_html_.attributepart.html) for expressions in HTML attribute value position.
*   [`BooleanAttributePart`](/api/classes/_lit_html_.booleanattributepart.html) for expressions in a boolean attribute value (name prefixed with `?`).
*   [`EventPart`](/api/classes/_lit_html_.eventpart.html) for expressions in an event listener position (name prefixed with `@`).
*   [`PropertyPart`](/api/classes/_lit_html_.propertypart.html) for expressions in property value position (name prefixed with `.`).
*   [`ElementPart`](/api/classes/_lit_html_.elementpart.html) for expressions on the element tag.

In addition to the part-specific metadata contained in `PartInfo`, all `Part` types provide access to the DOM `element` associated with the expression (or `parentNode`, in the case of `ChildPart`), which may be directly accessed in `update()`. For example:

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

In addition, the `directive-helpers.js` module includes a number of helper functions which act on `Part` objects, and can be used to dynamically create, insert, and move parts within a directive's `ChildPart`.

#### Render arguments

The `render()` arguments are passed into `update()` as an array. If you're implementing `update()` and using render arguments, you can pass them on like this:

```ts
class MyDirective extends Directive {
  update(part: Part, [fish, bananas]: DirectiveParameters<this>) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish: number, bananas: number) { ... }
}
```

### Differences between update() and render()

While the `update()` callback is more powerful than the `render()` callback, there is an important distinction: When using the `@lit/ssr` package for server-side rendering, _only_ the `render()` method is called on the server. To be compatible with SSR, directives should return values from `render()` and only use `update()` for imperative logic.

## Signaling no change

Sometimes a directive may have nothing new for Lit to render. You signal this by returning `noChange` from the `update()` or `render()` method. This is different from returning `undefined`, which causes Lit to clear the `Part` associated with the directive. Returning `noChange` leaves the previously rendered value in place.

There are several common reasons for returning `noChange`:

*   Based on the input values, there's nothing new to render.
*   The `update` method updated the DOM imperatively.
*   In an async directive, a call to `update()` or `render()` may return `noChange` because there's nothing to render _yet_.

For example, a directive can keep track of the previous values passed in to it, and perform its own dirty checking to determine whether the directive's output needs to be updated. The `update()` or `render()` method can return `noChange`  to signal that the directive's output doesn't need to be re-rendered.

```ts
import {Directive} from 'lit-html/directive.js';
import {noChange} from 'lit-html';
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

## Limiting a directive to one expression type

Some directives are only useful in one context, such as an attribute expression or a child expression. If placed in the wrong context, the directive should throw an appropriate error.

For example, the `classMap` directive validates that it is only used in an `AttributePart` and only for the `class` attribute`:

```ts
class ClassMap extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class')
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

## Async directives

The previous example directives are synchronous: they return values synchronously to their `render()`/`update()` lifecycle, so their results are written to the DOM during the component's `update()` callback.

Sometimes, you want a directive to be able to update the DOM asynchronously—for example, if it depends on an asynchronous event like a network request.

To set a value asynchronously, a directive needs to extend the `AsyncDirective` base class, which provides a `setValue()` API.

Here's an example of a simple async directive that renders a Promise value:

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

Here, the rendered template shows "Waiting for promise to resolve," followed by the resolved value of the promise, whenever it resolves.

Async directives often need to subscribe to external resources. To prevent memory leaks it is common for async directives to need to unsubscribe or dispose of resources when the directive instance is no longer in use.  For this purpose, `AsyncDirective` provides the following extra lifecycle callbacks:

* `disconnected()`: Called when a directive is no longer in use.  Directive instances are disconnected when the value of a given expression no longer resolves to the same directive, or if the subtree the directive was contained in was removed from the DOM.
* `reconnected()`: Because DOM subtrees can be temporarily disconnected and then reconnected again later (for example, when DOM is moved) a disconnected directive may need to react to being re-connected. So the `reconnected()` callback should always be implemented alongside `disconnected()`, in order to restore a disconnected directive back to its working state.

Below is an example of a directive that subscribes to an `Observable` and handles disconnection and reconnection appropriately:

```ts
class ObserveDirective extends AsyncDirective {
  observable: Observable<unknown> | undefined;
  unsubscribe: () => void | undefined;
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable: Observable<unknown>) {
    if (this.observable !== observable) {
      this.unsubscribe?();
      this.observable = observable
      this.subscribe(observable);
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
  // If the subtree the directive is in was disconneted and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable);
  }
}
export const observe = directive(ObserveDirective);
```


## Rendering multiple values in child expressions

Sometimes a directive may need to render multiple values. For example, a directive that renders a list of items (like `repeat()`) might create a nested `Part` for each item. Keeping separate parts lets you manipulate them efficiently: for example, you can change the value of a single part without re-rendering the entire list.

<div class="alert alert-info">

**Advanced content.** You should only need to manipulate nested parts if you're implementing your own list or or data table directive. If you are, reading the [source code of the `repeat()` directive](TODO_HREF) may provide you with a starting point.

</div>

The `directive-helpers.js` module contains helper methods for manipulating nested `ChildPart` objects:

* `insertPart(containerPart, refPart, part?)` - Inserts a `ChildPart` into the given container's DOM, either at the end of the container, or before the optional `refPart`. If `part` is not supplied, a new `ChildPart` is created.
* `removePart(part)` - Removes a `ChildPart` from the DOM, including any of its content.
* `clearPart(part)` - Clears any DOM rendered within the `ChildPart`.
* `setChildPartValue(value)` - Renders the given `value` into the `ChildPart`.

