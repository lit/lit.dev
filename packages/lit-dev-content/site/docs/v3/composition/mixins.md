---
title: Mixins
eleventyNavigation:
  parent: Composition
  key: Mixins
  order: 3
versionLinks:
  v2: composition/mixins/
---

Class mixins are a pattern for sharing code between classes using standard JavaScript. As opposed to "has-a" composition patterns like [reactive
controllers](/docs/v3/composition/controllers/), where a class can _own_ a controller to add
behavior, mixins implement "is-a" composition, where the mixin causes the class
itself to _be_ an instance of the behavior being shared.

You can use mixins to customize a Lit component by adding API or overriding its lifecycle callbacks.

## Mixin basics

Mixins can be thought of as "subclass factories" that override the class they
are applied to and return a subclass, extended with the behavior in the mixin.
Because mixins are implemented using standard JavaScript class expressions, they
can use all of the idioms available to subclassing, such as adding new
fields/methods, overriding existing superclass methods, and using `super`.

<div class="alert alert-info">

For ease of reading, the samples on this page elide some of the TypeScript types
for mixin functions. See [Mixins in TypeScript](#mixins-in-typescript) for details on proper
typing of mixins in TypeScript.

</div>

To define a mixin, write a function that takes a
`superClass`, and returns a new class that extends it, adding fields and methods
as needed:

```ts
const MyMixin = (superClass) => class extends superClass {
  /* class fields & methods to extend superClass with */
};
```

To apply a mixin, simply pass a class to generate a subclass with the mixin
applied. Most commonly, users will apply the mixin directly to a base class when defining
a new class:

```ts
class MyElement extends MyMixin(LitElement) {
  /* user code */
}
```

Mixins can also be used to create concrete subclasses that users can then extend
like a normal class, where the mixin is an implementation detail:

```ts
export const LitElementWithMixin = MyMixin(LitElement);
```

```ts
import {LitElementWithMixin} from './lit-element-with-mixin.js';

class MyElement extends LitElementWithMixin {
  /* user code */
}
```

Because class mixins are a standard JavaScript pattern and not Lit-specific,
there is a good deal of information in the community on leveraging mixins for
code reuse. For more reading on mixins, here are a few good references:

* [Class mixins](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends#mix-ins) on MDN
* [Real Mixins with JavaScript
  Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-JavaScript-classes/)
  by Justin Fagnani
* [Mixins](https://www.TypeScriptlang.org/docs/handbook/mixins.html) in the TypeScript handbook.
* [Dedupe mixin library](https://open-wc.org/docs/development/dedupe-mixin/) by
  open-wc, including a discussion of when mixin usage may lead to duplication,
  and how to use a deduping library to avoid it.
* [Mixin conventions](https://component.kitchen/elix/mixins) followed by Elix
  web component library. While not Lit-specific, contains thoughtful suggestions
  around applying conventions when defining mixins for web components.

## Creating mixins for LitElement

Mixins applied to LitElement can implement or override any of the standard
[custom element lifecycle](/docs/v3/components/lifecycle/#custom-element-lifecycle)
callbacks like the `constructor()` or `connectedCallback()`, as well as any of
the [reactive update lifecycle](/docs/v3/components/lifecycle/#reactive-update-cycle)
callbacks like `render()` or `updated()`.

For example, the following mixin would log when the element is created,
connected, and updated:

```ts
const LoggingMixin = (superClass) => class extends superClass {
  constructor() {
    super();
    console.log(`${this.localName} was created`);
  }
  connectedCallback() {
    super.connectedCallback();
    console.log(`${this.localName} was connected`);
  }
  updated(changedProperties) {
    super.updated?.(changedProperties);
    console.log(`${this.localName} was updated`);
  }
}
```

Note that a mixin should always make a super call to the standard custom element lifecycle
methods implemented by `LitElement`. When overriding a reactive update lifecycle
callback, it is good practice to call the super method if it already exists on
the superclass (as shown above with the optional-chaining call to
`super.updated?.()`).

Also note that mixins can choose to do work either before or after the base
implementation of the standard lifecycle callbacks via its choice of when to
make the super call.

Mixins can also add [reactive properties](/docs/v3/components/properties/),
[styles](/docs/v3/components/styles/), and API to the subclassed element.

The mixin in the example below adds a `highlight` reactive property to the
element and a `renderHighlight()` method that the user can call to wrap some
content. The wrapped content is styled yellow when the `highlight` property/attribute is set.

{% playground-ide "v3-docs/mixins/highlightable/" "highlightable.ts" %}

Note in the example above, the user of the mixin is expected to call the
`renderHighlight()` method from their `render()` method, as well as take care to add
the `static styles` defined by the mixin to the subclass styles. The nature of
this contract between mixin and user is up to the mixin definition and should be
documented by the mixin author.

## Mixins in TypeScript

When writing `LitElement` mixins in TypeScript, there are a few details to be
aware of.

### Typing the superclass

You should constrain the `superClass` argument to the type of class you expect
users to extend, if any. This can be accomplished using a generic `Constructor`
helper type as shown below:

```ts
import {LitElement} from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    /* ... */
  };
  return MyMixinClass as /* see "typing the subclass" below */;
}
```

The above example ensures that the class being passed to the mixin extends from
`LitElement`, so that your mixin can rely on callbacks and other API provided by
Lit.

### Typing the subclass

Although TypeScript has basic support for inferring the return type for the
subclass generated using the mixin pattern, it has a severe limitation in that
the inferred class must not contain members with `private` or `protected`
access modifiers.

<div class="alert alert-info">

Because `LitElement` itself does have private and protected members, by default
TypeScript will error with _"Property '...' of exported class expression may not
be private or protected."_ when returning a class that extends `LitElement`.

</div>

There are two workarounds that both involve casting the return type
from the mixin function to avoid the error above.

#### When a mixin does not add new public/protected API

If your mixin only overrides `LitElement` methods or properties and does not
add any new API of its own, you can simply cast the generated class to the super
class type `T` that was passed in:

```ts
export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    connectedCallback() {
      super.connectedCallback();
      this.doSomethingPrivate();
    }
    private doSomethingPrivate() {
      /* does not need to be part of the interface */
    }
  };
  // Cast return type to the superClass type passed in
  return MyMixinClass as T;
}
```

#### When a mixin adds new public/protected API

If your mixin does add new protected or public API that you need users to be
able to use on their class, you need to define the interface for the mixin
separately from the implementation, and cast the return type as the intersection
of your mixin interface and the super class type:

```ts
// Define the interface for the mixin
export declare class MyMixinInterface {
  highlight: boolean;
  protected renderHighlight(): unknown;
}

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    @property() highlight = false;
    protected renderHighlight() {
      /* ... */
    }
  };
  // Cast return type to your mixin's interface intersected with the superClass type
  return MyMixinClass as Constructor<MyMixinInterface> & T;
}
```

### Applying decorators in mixins

Due to limitations of TypeScript's type system, decorators (such as
`@property()`) must be applied to a class declaration statement and not a class
expression.

In practice this means mixins in TypeScript need to declare a class
and then return it, rather than return a class expression directly from the
arrow function.

Supported:
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  // ✅ Defining a class in a function body, and then returning it
  class MyMixinClass extends superClass {
    @property()
    mode = 'on';
    /* ... */
  };
  return MyMixinClass;
}
```

Not supported:
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) =>
  // ❌ Returning class expression directly using arrow-function shorthand
  class extends superClass {
    @property()
    mode = 'on';
    /* ... */
  }
```
