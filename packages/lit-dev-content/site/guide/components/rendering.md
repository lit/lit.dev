---
title: Rendering
eleventyNavigation:
  key: Rendering
  parent: Components
  order: 2
---

A Lit component typically implements its UI by rendering an encapsulated DOM tree.

Add a template to your component to define what it should render. Templates can include _expressions_, which are placeholders for dynamic content.

```ts
render() {
  return html`<div>Hello, ${name}.</div>`;
}
```

## When templates render

A Lit component renders its template initially when it's added to the DOM on a page. After the initial render, any change to the component's reactive properties triggers an update cycle, re-rendering the component.

The update cycle is _asynchronous_, so changes to multiple properties are batched into a single update. And when Lit updates, it only re-renders the changed portions of the DOM.

(See [What happens when properties change](/guide/components/properties/#update-cycle) for more information on the update cycle.)

## DOM encapsulation

Lit uses [shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom) to encapsulate the templated DOM. Shadow DOM provides three benefits:

* DOM scoping. DOM APIs like `document.querySelector` won't find elements in the
  component's shadow DOM, so it's harder for global scripts to accidentally break your component.
* Style scoping. You can write encapsulated styles for your shadow DOM that don't
  affect the rest of the DOM tree.
* Composition. The component's shadow DOM (managed by the component) is separate from the component's children. You can choose how children are rendered in your templated DOM. Component users can add and remove children using standard DOM APIs without accidentally breaking anything in your shadow DOM.

Where native shadow DOM isn't available, Lit can optionally use the [Shady DOM polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadydom) to provide emulated shadow DOM support.

## Define a template

To define a template for a Lit component, add a `render()` method:

{% playground-example "docs/templates/define" "my-element.js" %}

*   Write your template in HTML inside a JavaScript [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) by enclosing the raw HTML in back-ticks (<code>``</code>).

*   Tag your template literal with the [`html`](TODO_HREF) tag function.

*   The component's `render` method can return anything that Lit can render. Typically, it returns a single `TemplateResult` object (the same type returned by the `html` tag function).

Lit templates can include JavaScript _expressions_. You can use expressions to set text content, attributes, properties, and event listeners.

See the template [overview](/guide/templates/overview) for more information.

### Design a performant template

During an update, only the parts of the DOM that change are re-rendered. To get the performance benefits of this model, you should **design your element's template as a pure function of its properties**.

To do this, make sure the `render()` method:

* Does not change the component's state.
* Does not have any side effects.
* Only depends on the componentco's properties.
* Returns the same result when given the same property values.

Also, avoid making DOM updates outside of `render()`. Instead, express the component's template as a function of its state, and capture its state in properties.

The following code manipulates the rendered DOM. This is usually an anti-pattern:

_dom-manip.js_

```text
// Anti-pattern. Avoid!

constructor() {
  super();
  this.addEventListener('stuff-loaded', (e) => {
    this.shadowRoot.getElementById('message').innerHTML=e.detail;
  });
  this.loadStuff();
}
render() {
  return html`
    <p id="message">Loading</p>
  `;
}
```

You can improve the template by declaring the message as a _reactive property_, and using an expression in the template instead of setting the text imperatively. Declaring a reactive property tells your component to re-render its template when the property changes.

{% playground-example "docs/templates/design" "update-properties.ts" %}

See [Reactive properties](/guide/components/properties/) for information on declaring reactive properties.

## Compose a template from other templates

You can compose Lit templates from other templates. The following example composes a template for an component called `<my-page>` from smaller templates for the page's header, footer, and main content:

{% playground-example "docs/templates/compose" "my-page.ts" %}

You can also compose templates by importing other elements and using them in your template:

{% playground-ide "docs/templates/composeimports" %}


## See also

For more information on Lit templates:

* [Template overview](/guide/templates/overview/)


