---
title: Creating directives
eleventyNavigation:
  parent: Composition
  title: Creating directives
  key: Directives
  order: 2
---

## Overview

Directives are objects that can customize how Lit renders expressions. Using a directive in your template is like calling a function:

```js
html`<div>
     ${fancyDirective('some text')}
  </div>`
```

However, instead of simply _returning_ a value to render, a directive gets special access to the underlying DOM associated with its expression, and is persisted across multiple renders so it can be stateful. A directive can also be notified when it is disconnected or reconnected.

While Lit ships with a number of built-in directives like `repeat` and `cache`, users can author their own custom directives. To create a directive:

*   Implement the directive as a class that extends the `Directive` class.
*.  Pass your class to the `directive` factory to create a directive function that can be used in Lit template expressions.

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

When this template is evaluated, the directive function  (`hello`) returns a `DirectiveResult` which instructs Lit to create or update an instance of the `Directive` class (`HelloDirective`). Lit then calls methods on the class instance to update the  DOM.

## Lifecycle

### One-time setup: constructor()

When Lit encounters a `DirectiveResult` in an expression for the first time, it will construct an instance of the corresponding directive class, causing its constructor and any class field initializers to run:

```js
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

As long as the same directive function is used in the same expression each render, the previous instance will be reused, thus the state of the instance will persist between renders.

The constructor receives a single `PartInfo` object, which provides metadata about the expression the directive was used in. This can be useful for providing error checking in cases where directives are designed to be used only in specific types of expressions (see [below]()).

### Declarative rendering: render()

The `render()` method should return the value to render into the DOM. It can return any renderable value, including another `DirectiveResult`.

In addition to referring to state on the class instance, the `render()` method may also accept arbitrary arguments passed in from the template to calculate its return value. Any arguments defined for the `render()` method will determine the function signature of the directive itself:

```js
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
const template = html`<div>${myDirective(someNumber, 0)}</div>`;
```

### Imperative DOM manipulation: update()

In more advanced use cases, the directive may need to access the underlying DOM and imperatively read from or mutate it. This can be achieved by overriding the `update()` lifecycle.

The default implementation of `update()` simply calls and returns the value from `render()`. However, in addition to the render arguments, `update()` also receives a `part` argument with an API for directly managing the DOM associated with expressions.  Each expression position has its own specific `Part` object:

*   [`ChildPart`](/api/classes/_lit_html_.childpart.html) for expressions in HTML child position.
*   [`AttributePart`](/api/classes/_lit_html_.attributepart.html) for expressions in HTML attribute value position.
*   [`BooleanAttributePart`](/api/classes/_lit_html_.booleanattributepart.html) for expressions in a boolean attribute value (name prefixed with `?`).
*   [`EventPart`](/api/classes/_lit_html_.eventpart.html) for expressions in an event listener position (name prefixed with `@`).
*   [`PropertyPart`](/api/classes/_lit_html_.propertypart.html) for expressions in property value position (name prefixed with `.`).
*   [`ElementPart`](/api/classes/_lit_html_.elementpart.html) for expressions on the element tag.

In addition to the part-specific metadata contained in `PartInfo`, all `Part` types provide access to the DOM `element` associated with the expression (or `parentNode`, in the case of `ChildPart`), which may be directly accessed in `update()`. For example:

```js
class AttributeLogger extends Directive {
  update(part: Part) {
    // Renders attribute names of parent element to text
    return part.parentNode.getAttributeNames().join(' ');
  }
  // Unused; value is returned from update directly
  render() { return nothing; }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

In addition, the `directive-helpers.js` module includes a number of helper functions which act on `Part` objects, and can be used to dynamically create, insert, and move parts within a directive's `ChildPart`.

### Differences between `update()` and `render()`

While the `update()` callback is more powerful than the `render()` callback, there is an important distinction: When usingthe `@lit/ssr` package for server-side rendering, _only_ the `render()` method will be called on the server. To be compatible with SSR, directives should return values from `render()` and only use `update()` for imperative logic.

## Limiting a directive to one expression type

Some directives are only useful in one context, such as an attribute expression or a child expression. If placed in the wrong context, the directive should throw an appropriate error.

For example, the `classMap` directive validates that it is only used in an `AttributePart` and only for the `class` attribute`:

```js
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

## Asynchronous directives

The previous example directives are synchronous: they return values synchronously to their `render()`/`update()` lifecycle, so their results are written to the DOM during the component's `update()` callback.

Sometimes, you want a directive to be able to update the DOM asynchronously—for example, if it depends on an asynchronous event like a network request.

To set a value asynchronously, a directive needs to extend the `DisconnectableDirective` base class, which provides a `setValue()` API.

Here's an example of a simple asynchronous directive that renders a Promise value:

```js
class ResolvePromise extends DisconnectableDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
const resolvePromise = directive(ResolvePromise);
```

Here, the rendered template shows "Waiting for promise to resolve," followed by the resolved value of the promise, whenever it resolves.

Asynchronous directives often need to subscribe to external resources. To prevent memory leaks it is common for asynchronous directives to need to unsubscribe or dispose of resources when the directive instance is no longer in use.  For this purpose, `DisconnectableDirective` provides the following extra lifecycle callbacks:

* `disconnected()`: Called when a directive is no longer in use.  Directive instances are disconnected when the value of a given expression no longer resolves to the same directive, or if the subtree the directive was contained in was removed from the DOM.
* `reconnected()`: Because DOM subtrees can be temporarily disconnected and then reconnected again later (for example, when DOM is moved) a disconnected directive may need to react to being re-connected. As such, the `reconnected()` callback should always be implemented alongside `disconnected()`, in order to restore a disconnected directive back to its working state.

Below is an example of a directive that subscribes to an `Observable` and handles disconnection and reconnection appropriately:

```js
class ObserveDirective extends DisconnectableDirective {
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
const observe = directive(ObserveDirective);
```


## Rendering multiple values in child expressions

Sometimes a directive may need to render multiple values. For example, a directive that renders a list of items (like `repeat`) might create a nested `Part` for each item. Keeping separate parts lets you manipulate them efficiently: for example, you can change the value of a single part without re-rendering the entire list.

The `directive-helpers.js` module contains helper methods for manipulating nested parts:

* `insertPart(containerPart, refPart, part?)` - Inserts a `ChildPart` into the given container ChildPart's DOM, either at the end of the container ChildPart, or before the optional `refPart`. If not supplied, a new `ChildPart` is created.
* `removePart(part)` - Removes a ChildPart from the DOM, including any of its content.
* `clearPart(part)` - Clears any DOM rendered within the `ChildPart`.
* `setChildPartValue(value)` - Renders the given `value` into the `ChildPart`.

Putting it all together—the following example directive takes a value and inserts it into the DOM _twice_ by creating two nested parts, which are stored as state on the directive instance.

```js
// Import lit-html APIs
import {html, render} from 'lit-html';
import {directive, Directive, PartInfo} from 'lit-html/directive.js';
import {insertPart, clearPart, setChildPartValue} from 'lit-html/directive-helpers.js';

// Directive that takes a single value, and renders it in the DOM twice
class Duplicate extends Directive {
  lastValue: unknown = undefined;
  parts: ChildPart[] | undefined = undefined;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    // Validate that the directive is only used in child node position
    if (partInfo !== PartType.CHILD) {
      throw new Error('duplicate directive can only be used in child expressions');
    }
  }

  // On the client, use nested parts (for demonstration purposes)
  update(part: Part, [value: unknown]) {
    // Create parts once ever
    if (this.parts === undefined) {
      clearPart(containerPart);
      this.parts = [
        insertPart(containerPart),
        insertPart(containerPart)
      ];
    }
    //
    if (this.lastValue !== value) {
      setChildPartValue(this.parts[0], value);
      setChildPartValue(this.parts[1], value);
      this.lastValue = value;
    }
    return noChange;
  }

  // Only called during SSR; fallback to rendering an interable
  render(value: unknown) {
    return [value, value];
  }

};
const duplicate = directive(Duplicate);
```
