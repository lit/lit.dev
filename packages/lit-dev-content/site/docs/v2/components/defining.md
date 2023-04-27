---
title: Defining a component
eleventyNavigation:
  key: Defining
  parent: Components
  order: 1
versionLinks:
  v1: components/templates/
  v3: components/defining/
---

Define a Lit component by creating a class extending `LitElement` and registering your class with the browser:

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { /* ... */ }
```

The `@customElement` decorator is shorthand for calling [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define), which registers a custom element class with the browser and associates it with an element name (in this case, `simple-greeting`).

If you're using JavaScript, or if you're not using decorators, you can call `define()` directly:

```js
export class SimpleGreeting extends LitElement { /* ... */  }
customElements.define('simple-greeting', SimpleGreeting);
```

## A Lit component is an HTML element

When you define a Lit component, you're defining a [custom HTML element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). So you can use the new element like you'd use any built-in element:

```html
<simple-greeting name="Markup"></simple-greeting>
```

```js
const greeting = document.createElement('simple-greeting');
```

The `LitElement` base class is a subclass of `HTMLElement`, so a Lit component inherits all of the standard `HTMLElement` properties and methods.

Specifically, `LitElement` inherits from `ReactiveElement`, which implements reactive properties, and in turn inherits from `HTMLElement`.

<img alt="Inheritance diagram showing LitElement inheriting from ReactiveElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; ReactiveElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements." class="centered-image" src="/images/docs/components/lit-element-inheritance.png">

## Providing good TypeScript typings {#typescript-typings}

TypeScript will infer the class of an HTML element returned from certain DOM
APIs based on the tag name. For example, `document.createElement('img')` returns
an `HTMLImageElement` instance with a `src: string` property.

Custom elements can get this same treatment by adding to the
`HTMLElementTagNameMap` as follows:

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number})
  aNumber: number = 5;
  /* ... */
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
```

By doing this, the following code properly type-checks:

```ts
const myElement = document.createElement('my-element');
myElement.aNumber = 10;
```

We recommend adding an `HTMLElementTagNameMap` entry for all elements authored
in TypeScript, and ensuring you publish your `.d.ts` typings in your npm
package.


