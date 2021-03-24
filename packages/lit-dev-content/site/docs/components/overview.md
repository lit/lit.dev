---
title: Components overview
eleventyNavigation:
  key: Overview
  parent: Components
  order: 1
---

A Lit component is a reusable piece of UI. You can think of a Lit component as a container that has some state and that displays a UI based on its state. It can also react to user input, fire events—anything you'd expect a UI component to do. And a Lit component is an HTML element, so it has all of the standard element APIs.

A Lit component has several features:

 *   A **render method** that's called to render the component's contents. In the render method, you define a *template* for the component.

*   **Reactive properties** that define the state of the component. Changing one or more of the components' reactive properties triggers an update cycle, re-rendering the component.

*   Encapsulated **styles** to control the appearance of the component.

*   **Lifecycle callbacks** that you can override to hook into the component's lifecycle—for example, to run code when the element's added to a page, or whenever the component updates.

To define a Lit component, you create a class that extends the `LitElement` base class.

Here's a sample component:

{% playground-example "docs/components/overview/simple-greeting" "simple-greeting.ts" %}

<div class="alert alert-info">

**TypeScript or JavaScript?** Unless otherwise noted, samples are in TypeScript, but you can use plain JavaScript with Lit, too.

</div>

## A Lit component is an HTML element

When you define a Lit component, you're defining a [custom HTML element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). So you can use the new element like you'd use any built-in element:

```html
<simple-greeting name="Markup"></simple-greeting>
```

```js
const greeting = document.createElement('simple-greeting');
```

Create a Lit component by creating a class extending `LitElement` and registering your class with the browser:

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { ... }
```

The [`@customElement`](/api/modules/_lit_element_.html#customelement) decorator is shorthand for calling [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define), which registers a custom element class with the browser and associates it with an element name (in this case, `simple-greeting`).

The `LitElement` base class is a subclass of `HTMLElement`, so a Lit component inherits all of the standard `HTMLElement` properties and methods.

Specificially, `LitElement` inherits from `ReactiveElement`, which implements reactive properties, and in turn inherits from `HTMLElement`.

![Inheritance diagram showing LitElement inheriting from ReactiveElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; ReactiveElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements.](/images/docs/components/lit-element-inheritance.png)

## Templates and rendering

A Lit component's `render()` method defines a *template* for the component. The template can contain *expressions* that are updated when the component renders:

```js
render() {
  return html`<p>Hello, ${this.name}!</p>`;
}
```

By default the rendered DOM is encapsulated using [shadow DOM](/docs/components/shadow-dom/).

Read more:

*   [Rendering](/docs/components/rendering/)
*   [Shadow DOM](/docs/components/shadow-dom/)
*   [Template overview](/docs/templates/overview/)

## Styles

You can specify encapsulated styles for your component using the static `styles` property:

```ts
class MyElement extends LitElement {
  static styles = css`/* your CSS here */`;
}
```

These styles are applied to every instance of your component.

Read more:

*   [Styles](/docs/components/styles/)

## Reactive properties

You can define any number of properties on your component as *reactive properties*:

```ts
class MyElement extends LitElement {
  @property() message;
}
```

Changing the value of a reactive property triggers an *update*. (The update process is asynchronous, so setting multiple properties at the same time only triggers one update.)

Read more:

*   [Reactive properties](/docs/components/properties)

## Lifecycle

Lit components use the standard custom element lifecycle methods. In addition Lit introduces a *reactive update cycle* that renders changes to DOM when reactive properties change.

Read more:

*   [Lifecycle](/docs/components/lifecycle)
