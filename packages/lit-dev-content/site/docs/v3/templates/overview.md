---
title: Templates overview
eleventyNavigation:
  key: Overview
  parent: Templates
  order: 1
versionLinks:
  v1: components/templates/
  v2: templates/overview/
---

{% todo %}

If time permits, add new page on working with inputs, per outline.

{% endtodo %}

Lit templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative, HTML:

```js
html`<h1>Hello ${name}</h1>`
```

The template syntax might look like you're just doing string interpolation. But with tagged template literals, the browser passes the tag function an array of strings (the static portions of the template) and an array of expressions (the dynamic portions). Lit uses this to build an efficient representation of your template, so it can re-render only the parts of template that have changed.

Lit templates are extremely expressive and allow you to render dynamic content in a variety of ways:

 - [Expressions](/docs/v3/templates/expressions/): Templates can include dynamic values called *expressions* that can be used to render attributes, text, properties, event handlers, and even other templates.
 - [Conditionals](/docs/v3/templates/conditionals/): Expressions can render conditional content using standard JavaScript flow control.
 - [Lists](/docs/v3/templates/lists/): Render lists by transforming data into arrays of templates using standard JavaScript looping and array techniques.
 - [Built-in directives](/docs/v3/templates/directives/): Directives are functions that can extend Lit's templating functionality. The library includes a set of built-in directives to help with a variety of rendering needs.
 - [Custom directives](/docs/v3/templates/custom-directives/): You can also write your own directives to customize Lit's rendering as needed.

## Standalone templating

You can also use Lit's templating library for standalone templating, outside of a Lit component. For details, see [Standalone lit-html templates](/docs/v3/libraries/standalone-templates).
