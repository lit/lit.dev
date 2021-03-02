---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Templates
  order: 1
---

{% todo %}

If time permits, add new page on working with inputs, per outline.

{% endtodo %}

Lit templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative, [HTML](/guide/templates/html):

```js
html`<h1>Hello World</h1>`
```

The static string content of a template must be [well-formed HTML](/guide/templates/html#well-formed). You can add dynamic content to your templates with [expressions](/guide/templates/expressions). Expressions are denoted with the standard JavaScript syntax for expressions in template literals:

```js
html`<h1>Hello ${name}</h1>`
```

The `html` tag function returns a `TemplateResult` object—a lightweight object that represents a template that Lit can render.

You can define a Lit component's template inside its `render` function:

```js
import {LitElement, html} from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  name = 'World;

  render() {
    return html`<div>Hello, ${this.name}</div>`;
  }
}
```

As shown in the example, you can use `this` inside an expression to access instance properties and methods on your component.

## Efficient updates

The template syntax might look like you're just doing string interpolation. But with tagged template literals, the browser passes the tag function an array of strings (the static portions of the template) and an array of expressions (the dynamic portions). Lit uses this to build an efficient representation of your template, so it can re-render only the parts of template that have changed.

When you render a template, Lit's templating library checks each expression's value against the previously rendered value, and only re-renders that expression if its value has changed.

## Standalone templating

You can also use Lit's templating library for standalone templating, outside of a Lit component. For details, see [Standalone lit-html templates](/guides/libraries/standalone-templates).
