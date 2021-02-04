---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Components
  order: 1
---

A Lit component is a reusable piece of UI. You can think of a Lit component as a container that has some state and that displays a UI based on its state. It can also react to user input, fire events—anything you'd expect a UI component to do. And a Lit component is an HTML element, so it has all of the standard element APIs.

 Almost all Lit components include:

*   *Reactive properties* that define the state of the component. Changing one or more of the components' reactive properties triggers an update cycle, re-rendering the component.

*   A *render method* that's called to render the component's contents. In the render method, you define a *template* for the component.

Lit also provides a set of lifecycle methods that you can override to hook into the component's lifecycle (for example, to run code whenever the component updates).

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
greeting.name = 'Script';
document.body.appendChild(greeting);
```

Create a Lit component by creating a class extending LitElement and registering your class with the browser:

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { ... }
```

Or in JavaScript:

```js
export class SimpleGreeting extends LitElement { ... }
customElements.define('simple-greeting', SimpleGreeting);
```

The [`@customElement`](/api/modules/_lit_element_.html#customelement) decorator is shorthand for calling [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define), which registers a custom element class with the browser and associates it with an element name (in this case, `simple-greeting`).

The `LitElement` base class is a subclass of `HTMLElement`, so a Lit component inherits all of the standard `HTMLElement` properties and methods.

Specificially, `LitElement` inherits from `ReactiveElement`, which implements reactive properties, and in turn inherits from `HTMLElement`.

![Inheritance diagram showing LitElement inheriting from ReactiveElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; ReactiveElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements.](/images/guide/components/lit-element-inheritance.png)

## Rendering, templates and styles

A Lit component's `render` method defines a *template* for the component. The template can contain *expressions* that are updated when the component renders:

```js
render() {
  return html`<p>Hello, ${this.name}!</p>`;
}
```

By default the rendered DOM is encapsulated using [shadow DOM](/guide/components/shadow-dom/). This has three main benefits:

*   *DOM composition* means that users can provide child nodes without interfering with the component's internal DOM. The component author decides where or if user-provided child nodes render.

*   *DOM encapsulation* means that outside code (like `document.querySelector`) won't accidentally select elements in your component's shadow DOM.

*   *Style encapsulation* means that you scope styles to your component, and prevent outside CSS styles from leaking in.

You can specify encapsulated styles for your component using the static `styles` property:

```ts
class MyElement extends LitElement {
  static styles = css`/* your CSS here */`;
}
```

These styles are applied to every instance of your component.

Read more:

*   [Rendering](/guide/components/rendering/)
*   [Template overview](/guide/templates/overview/)
*   [Styles](/guide/components/styles/)

## Reactive properties

You can define any number of properties on your component as *reactive properties*:

```ts
class MyElement extends LitElement {
  @property() message;
}
```

Changing the value of a reactive property triggers an *update*. (The update process is asynchronous, so setting multiple properties at the same time only triggers one update.)

During the update, a series of update related callbacks are called. As part of the process, the component's `render()` method is called and its UI updated.

A reactive property can be set to *reflect* to an attribute. This means a corresponding attribute is set on the component when the property value changes. (Or in the case of a boolean property, the attribute is added when the property is true, and removed when the property is false.) Attribute reflection also happens during the update process.

In addition to public properties, a component can have internal reactive state: private or protected properties that aren't part of the component's public API, but can still trigger an update. Use the `@state` decorator to declare internal reactive state:

```ts
class MyElement extends LitElement {
  @property() message;
  @state() private _language;
}
```

Read more:

*   [Reactive properties](/guide/components/properties)
*   [Lifecycle](/guide/components/lifecycle)
