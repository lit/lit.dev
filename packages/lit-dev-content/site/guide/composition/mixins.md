---
title: Mixins
eleventyNavigation:
  parent: Composition
  key: Mixins
  order: 3
---

Javascript class mixins are a stadard Javascript code pattern for sharing code
between classes. Mixins can be useful for adding behavior to Lit component
classes by adding to or overriding their lifecycle callbacks and adding API to
the class.

## Mixin basics

Mixins can be thought of as "subclass factories" that override the class they
are applied to and return a subclass, extended with the behavior in the mixin.
Because mixins are implemented using standard Javascript class expressions, they
can use all of the idioms available to subclassing, such as adding new
fields/methods, overriding existing superclass methods, and using `super`.

<div class="alert alert-info">

For ease of reading, the samples on this page elide some of the TypeScript types
for mixin functions. See [below](#mixins-in-typescript) for details on proper
typing of mixins in TypeScript.

</div>

To define a mixin, write a function that takes a
`superClass`, and returns a new class that extends it, adding fields & methods
as needed:

```ts
const MyMixin = (superClass) => class extends superClass {
  /* class fields & methods to extend superClass with */
};
```

To apply a mixin, simply pass a class to generate a subclass with the mixin
applied:

```ts
const LitElementWithMixin = MyMixin(LitElement);
```

Most commonly, users will apply the mixin directly to a base class when defining
a new class:

```ts
class MyElement extends MyMixin(LitElement) {
  /* user code */
}
```

## Creating mixins for LitElement

Mixins applied to LitElement can implement or override any of the standard
[custom element lifecycle](../components/lifecycle/#custom-element-lifecycle)
callbacks like the `constructor()` or `connectedCallback()`, as well as any of
the [reactive update lifecycle](../components/lifecycle/#reactive-update-cycle)
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

Note that a mixin should always super to the standard custom elmeent lifecycle
methods implemented by `LitElement`. When overriding a reactive update lifecycle
callback, it is good practice to call the super method if it already exists on
the superclass (as shown above with the optional-chaining call to
`super.updated.?()`).

Also note that mixins can choose to do work either before or after the base
implementation of the standard lifecycle callbacks via its choice of when to
make the super call.

Mixins can also add [reactive properties](../../components/properties/),
[styles](../../components/styles/), and and API to the subclassed element.

The mixin in the example below adds a reactive property `highlight` to the
element and a `renderHighlight` method that the user can call to wrap some
content will be styled yellow when the `highlight` property/attribute is set.

{% playground-ide "docs/mixins/highlightable/" "highlightable.ts" %}

Note in the example above, the user of the mixin is expected to call the
`renderHighlight` method from their `render` method, as well as take care to add
the `static styles` defined by the mixin to the subclass styles. The nature of
this contract between mixin and user is up to the mixin definition and should be
documented by the mixin author.

## Mixins in TypeScript

When writing `LitElement` mixins in TypeScript, there are a few details to be
aware of.

### Constraining the superclass

You should use a generic type to constrain the `superClass` argument to the type
of class you expect users to extend, if any. When writing mixins that apply to
`LitElement`, you can use the `LitElementConstructor` type from `lit`:

```ts
import {LitElementConstructor} from 'lit';

export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  class MyMixinClass extends superClass {
    /* ... */
  };
  return MyMixinClass;
}
```

This ensures that the class being passed to the mixin extends from `LitElement`,
so that your mixin can rely on callabcks and other API provided by Lit.

To constrain your mixin to an arbitrary class (for example, a base class of your
own making), you can use a generic `Constructor` type helper:

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

export const MyMixin = <T extends Constructor<SomeBaseClass>>(superClass: T) => {
  class MyMixinClass extends superClass {
    /* ... */
  };
  return MyMixinClass;
}

```

### Applying decorators in mxins

Due to limitations of TypeScript's type system, decorators (such as
`@property()`) must be applied to a class declaration statement and not a class
expression.

In practice this means mixins in TypeScript need to declare a class
and then return it, rather than return a class expression directly from the
arrow function.

Not supported:
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) =>
  // ❌ Returning class expression direcly using arrow-function shorthand
  class extends superClass {
    @property()
    mode = 'on';
    /* ... */
  }
```

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

### Protected and private members

As a current limitation of the type system, TypeScript does not support adding
class members with `private` or `protected` access modifiers via a mixin.

Not supported:
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  class MyMixinClass extends superClass {
    @state()
    // ❌ Typescript does not support private access modifiers in mixins
    private wasClicked = false;
    /* ... */
  }
  return MyMixinClass;
}
```

As an alternative, we recommend using symbols for hiding private fields/methods
referenced internally by the mixin when necessary. This can also serve to help
avoid naming collisions with users of the mixin. For example:

```ts
const wasClicked = Symbol();

export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  class MyMixinClass extends superClass {
    @state()
    [wasClicked] = false;

    constructor() {
      super();
      this.addEventListener('click', () => this[wasClicked] = true);
    }

    renderClickedState() {
      return html`<div>${this[wasClicked] ? 'Clicked!' : 'Waiting...'}</div>`;
    }
  };
  return MyMixinClass;
}
```

For more details on writing mixins in TypeScript, refer to
[Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) in the
TypeScript handbook.

## For more reading

Because class mixins are a standard Javascript pattern and not Lit-specific,
there is a good deal of information in the community on leveraging mixins for
code reuse. Here are a few good references:

* [Class mixins](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#mix-ins) on MDN
* [Real Mixins with JavaScript
  Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
  by Justin Fagnani
* [Dedupe mixin library](https://open-wc.org/docs/development/dedupe-mixin/) by
  open-wc, including a discussion of when mixin usage may lead to duplication,
  and how to use a deduping library to avoid it.
* [Mixin conventions](https://component.kitchen/elix/mixins) followed by Elix
  web component library. While not Lit-speciic, contains thoughtful suggestions
  around applying conventions when defining mixins.
