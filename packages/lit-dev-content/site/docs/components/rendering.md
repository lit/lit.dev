---
title: Rendering
eleventyNavigation:
  key: Rendering
  parent: Components
  order: 2
---

Add a template to your component to define what it should render. Templates can include _expressions_, which are placeholders for dynamic content.

```ts
render() {
  return html`<div>Hello, ${name}.</div>`;
}
```

## When templates render

A Lit component renders its template initially when it's added to the DOM on a page. After the initial render, any change to the component's reactive properties triggers an update cycle, re-rendering the component.

The update cycle is _asynchronous_, so changes to multiple properties are batched into a single update. And when Lit updates, it only re-renders the changed portions of the DOM.

For more information about the update cycle, see [What happens when properties change](/docs/components/properties/#update-cycle).

## DOM encapsulation

Lit uses shadow DOM to encapsulate the DOM a component renders. Shadow DOM provides three benefits:

* DOM scoping. DOM APIs like `document.querySelector` won't find elements in the
  component's shadow DOM, so it's harder for global scripts to accidentally break your component.
* Style scoping. You can write encapsulated styles for your shadow DOM that don't
  affect the rest of the  page. No need for conventions like BEM to associate styles with your component.
* Composition. The component's shadow DOM (managed by the component) is separate from the component's children. You can choose how children are rendered in your templated DOM. Component users can add and remove children using standard DOM APIs without accidentally breaking anything in your shadow DOM.

For more information about shadow DOM, see [Shadow DOM v1: Self-Contained Web Components
](https://developers.google.com/web/fundamentals/web-components/shadowdom) on Web Fundamentals.

<div class="alert alert-info">

Where native shadow DOM isn't available on older browsers, Lit can optionally use the [Shady DOM polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadydom) to provide emulated shadow DOM support.

</div>

## Define a template

To define a template for a Lit component, add a `render()` method:

{% playground-example "docs/templates/define" "my-element.ts" %}

*   Write your template in HTML inside a JavaScript [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) by enclosing the raw HTML in back-ticks (<code>``</code>).

*   Tag your template literal with the [`html`](TODO_HREF) tag function.

*   The component's `render` method can return anything that Lit can render. Typically, it returns a single `TemplateResult` object (the same type returned by the `html` tag function).

Lit templates can include JavaScript _expressions_. You can use expressions to set text content, attributes, properties, and event listeners.

For more information, see [Templates overview](/docs/templates/overview/).

### Design a performant template

During an update, only the parts of the DOM that change are re-rendered. Although Lit templates look like string interpolation, Lit parses and creates static HTML once, and then only updates changed values in expressions after that, making updates very efficient.

To take best advantage of Lit's functional rendering model, follow these guidelines for implementing your `render()` method:

* Does not change the component's state.
* Does not have any side effects.
* Only depends on the component's properties.
* Returns the same result when given the same property values.

Also, avoid making DOM updates outside of `render()`. Instead, express the component's template as a function of its state, and capture its state in properties.

The following code manipulates the rendered DOM. This is usually an anti-pattern:

```ts
// Anti-pattern. Avoid!
constructor() {
  super();
  this.loadStuff().then((content) => {
    this.shadowRoot.querySelector('#message')
      .innerHTML = content;
  });
}
render() {
  return html`
    <p id="message">Loading</p>
  `;
}
```

You can improve the template by declaring the message as a _reactive property_, and using an expression in the template instead of setting the text imperatively. Declaring a reactive property tells your component to re-render its template when the property changes.

{% playground-example "docs/templates/design" "update-properties.ts" %}

For more information, see [Reactive properties](/docs/components/properties/).

## Compose a template from other templates

You can compose Lit templates from other templates. The following example composes a template for an component called `<my-page>` from smaller templates for the page's header, footer, and main content:

{% playground-example "docs/templates/compose" "my-page.ts" %}

You can also compose templates by importing other elements and using them in your template:

{% playground-ide "docs/templates/composeimports" %}


## See also

* [Reactive properties](/docs/components/properties/)
* [Shadow DOM](/docs/components/shadow-dom/)
* [Templates overview](/docs/templates/overview/)
* [Template expressions](/docs/templates/overview/)



