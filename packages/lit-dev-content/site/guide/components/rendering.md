---
title: Rendering
eleventyNavigation:
  key: Rendering
  parent: Components
  order: 2
---

Add a template to your component to define internal DOM to implement your component.

To encapsulate the templated DOM LitElement uses
[shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom).
Shadow DOM provides three benefits:

* DOM scoping. DOM APIs like `document.querySelector` won't find elements in the
  component's shadow DOM, so it's harder for global scripts to accidentally break your component.
* Style scoping. You can write encapsulated styles for your shadow DOM that don't
  affect the rest of the DOM tree.
* Composition. The component's shadow DOM (managed by the component) is separate from the component's children. You can choose how children are rendered in your templated DOM. Component users can add and remove children using standard DOM APIs without accidentally breaking anything in your shadow DOM.

Where native shadow DOM isn't available, LitElement
uses the [Shady CSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss) polyfill.


## Define and render a template

To define a template for a LitElement component, write a `render` function for your element class:

```js
import { LitElement, html } from 'lit-element';

class MyElement extends LitElement {
  render() {
    return html`<p>template content</p>`;
  }
}
```

*   Write your template in HTML inside a JavaScript [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) by enclosing the raw HTML in back-ticks
    (<code>``</code>).


*   Tag your template literal with the [`html`](https://lit-html.polymer-project.org/api/modules/lit_html.html#html)
    tag function.

*   The component's `render` method can return anything that lit-html can render. Typically, it
    returns a single `TemplateResult` object (the same type returned by the `html` tag function).

Example

<playground-ide project-src="/samples/docs/templates/define/project.json">
</playground-ide>

lit-html templates can include _bindings_ that can contain any JavaScript expression. You can use bindings to set text content, attributes, properties, and event listeners.

See [Writing templates](/guide/templates/writing-templates)
and the [Template syntax reference](/guide/templates/template-reference) for complete details.

### Design a performant template

LitElement renders and re-renders asynchronously, updating in response to batched property changes (see [Element update lifecycle](#lifecycle) for more information).

During an update, only the parts of the DOM that change are re-rendered. To get the performance benefits of this model, you should **design your element's template as a pure function of its properties**.

To do this, make sure the `render` function:

* Does not change the element's state.
* Does not have any side effects.
* Only depends on the element's properties.
* Returns the same result when given the same property values.

Also, avoid making DOM updates outside of `render`. Instead, express the element's template as a function of its state, and capture its state in properties.

The following code uses inefficient DOM manipulation:

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

We can improve the template by declaring the message as a property, and binding the property into the template. Declaring a property tells your component to re-render its template when the property changes.


_update-properties.js_

```js
class MyElement extends LitElement {
  static get properties() {
    return {
      message: {type: String}
    }
  }

  constructor() {
    super();
    this.message = 'Loading';
    this.addEventListener('stuff-loaded', (e) => { this.message = e.detail } );
    this.loadStuff();
  }
  render() {
    return html`
      <p>${this.message}</p>
    `;
  }
}
```

<playground-ide project-src="/samples/docs/templates/design/project.json"></playground-ide>

The following sections discuss different types of property bindings. See [Properties](properties) for information on declaring properties.

## Compose a template from other templates

You can compose Lit templates from other templates. In the following example, we compose a template for an element called `<my-page>` from smaller templates for the page's header, footer, and main content:

```js
  function headerTemplate(title) {
    return html`<header>${title}</header>`;
  }
  function articleTemplate(text) {
    return html`<article>${text}</article>`;
  }
  function footerTemplate() {
    return html`<footer>Your footer here.</footer>`;
  }

class MyPage extends LitElement {
  ...
  render() {
    return html`
      ${headerTemplate(this.article.title)}
      ${articleTemplate(this.article.text)}
      ${footerTemplate()}
    `;
  }
}
```

<playground-ide project-src="/samples/docs/templates/compose/project.json"></playground-ide>

You can also compose templates by importing other elements and using them in your template:

```js
import './my-header.js';
import './my-article.js';
import './my-footer.js';

class MyPage extends LitElement {
  render() {
    return html`
      <my-header></my-header>
      <my-article></my-article>
      <my-footer></my-footer>
    `;
  }
}
```

<playground-ide project-src="/samples/docs/templates/composeimports/project.json"></playground-ide>


## Resources

For more information on lit-html templates:

* [Writing templates](/guide/templates/writing-templates)
* [Template syntax reference](/guide/templates/template-reference)

