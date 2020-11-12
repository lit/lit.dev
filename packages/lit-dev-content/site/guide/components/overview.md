---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Components
  order: 1
---

A Lit component is a reusable piece of UI. You can think of a Lit component as a container that has some state and that displays its state to the user. It may also react to user input, fire events—anything you'd expect a UI component to do.

 Almost all Lit components include:

*   *Reactive properties* that define the state of the component. Changing one or more of the components' reactive properties triggers an update cycle, re-rendering the component.

*   A *render method* that's called to render the components' contents. In the render method, you define a *template* for the component.

Lit also provides a set of lifecycle methods that you can override to hook into the lifecycle (for example, to run code whenever the component updates).

To define a Lit component, you create a class that extends from the `LitElement` base class.

Here's a sample component:

{% highlight js %}
import { LitElement, css, html, property, customElement } from 'lit-element';

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      border: solid 1px blue;
    }
  `;

  // Declare reactive properties
  @property()
  name = 'World';

  // Render the UI as a function of component state
  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
{% endhighlight %}

<div class="alert alert-info">

**TypeScript or JavaScript?** Unless otherwise noted, samples are in TypeScript, but you can use plain JavaScript with Lit, too.

</div>

## A Lit component is a custom element

When you define a Lit component, you're defining a [custom element](TODO-ADD-HREF).

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { ... }
```

Or in JavaScript:

```js
export class SimpleGreeting extends LitElement { ... }
customElements.define('simple-greeting', SimpleGreeting);
```

The `@customElement` decorator is shorthand for calling `customElements.define`, which registers a custom element class with the browser and associates it with an element name (in this case, `simple-greeting`). So you can use the new element like you'd use any built-in element:

```html
<simple-greeting name="Markup"></simple-greeting>
```

```js
const greeting = document.createElement('simple-greeting');
greeting.name = 'Script';
document.body.appendChild(greeting);
```

The `LitElement` base class is a subclass of `HTMLElement`, so a Lit component inherits all of the standard `HTMLElement` properties and methods.

Specificially, `LitElement` inherits from `UpdatingElement`, which implements reactive properties, and in turn inherits from `HTMLElement`.

![Inheritance diagram showing LitElement inheriting from UpdatingElement, which in turn inherits from HTMLElement. LitElement is responsible for templating; UpdatingElement is responsible for managing reactive properties and attributes; HTMLElement is the standard DOM interface shared by all native HTML elements and custom elements.](/images/guide/components/lit-element-inheritance.png)

## Rendering, templates and styles

A Lit component's `render` method defines a *template* for the component. The template can contain *binding expressions* that are updated when the component renders:

```js
render() {
  return html`<p>Hello, ${this.name}!</p>`;
}
```

By default the rendered DOM is encapsulated using [shadow DOM](TODO-ADD-HREF). This has two main benefits:

*   *Style encapsulation* means that you scope styles to your component, and prevent outside CSS styles from leaking in.

*   *DOM encapsulation* means that outside code (like `document.querySelector`) won't accidentally select elements in your component's shadow DOM.

You can specify encapsulated styles for your component using the static `styles` property:

```ts
static styles = css`
  /* Style the component itself */
  :host {
    border: solid 1px blue;
  }
  /* Style an element in the shadow DOM */
  p {
    color: blue;
  }
`;
```

Read more:

*   [Rendering](/guide/components/rendering)
*   [Template overview](/guide/templates/overview)

## Reactive properties

You can define any number of properties on your component as *reactive properties*. Changing the value of a reactive property triggers an *update cycle*. (The update cycle is asynchronous, so setting multiple properties at the same time only triggers one update.)

 The following things happen during an update cycle:

*   The element's template is re-rendered with any updated values.

*   Update related callbacks are called.

In addition, a property can be set to *reflect* to an attribute. This means a corresponding attribute is set on the component when the property value changes. (Or in the case of a boolean property, the attribute is added when the property is true, and removed when the property is false.) Attribute reflection also happens during the update cycle.

Read more:

*   [Reactive properties](/guide/components/properties)
*   [Lifecycle](/guide/components/lifecycle)
