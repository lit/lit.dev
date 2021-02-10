---
title: What is Lit?
eleventyNavigation:
  key: What is Lit
  parent: Introduction
  order: 1
---

{% todo %}

This is placeholder content, need to decide what exactly we want to say here.

{% endtodo %}

At its core, Lit is two small and fast libraries that help you build web components. lit-html - a declarative template system that leads the pack in size, speed, and expressiveness, and LitElement - a web component base class that combines lit-html with boilerplate-killing reactive state, scoped styles, and a flexible rendering lifecycle.

Lit is a collection of libraries and tools that help you build web components and design systems.

Lit's main library is lit-element, which provides the LitElement base class and several utilities for writing declarative, reactive, and encapsulated web components.

The Lit family of libraries includes:

* lit-html: An efficient and expressions declarative template librar
* lit-ssr: Node.js server-side rendering for LitElement
* lit-localize: Localization for lit-html templates
* lit-virtualizer: Fast virtual lists for lit-html
* lit-analyzer: Tools for type-checking and linting lit-html

## LitElement

LitElement pulls all the pieces of the Lit ecosystem into one easy-to-write, extremely fast and lightweight component authoring system.

## lit-html

lit-html is a simple, modern, safe, small and fast HTML templating library for JavaScript.

lit-html lets you write HTML templates in JavaScript using [template literals] with embedded JavaScript expressions. lit-html identifies the static and dynamic parts of your templates so it can efficiently update just the changed portions.

lit-html templates are tagged template literals - they look like JavaScript strings but are enclosed in backticks (`` ` ``) instead of quotes - and tagged with lit-html's `html` tag:

```js
html`<h1>Hello ${name}</h1>`
```

Since lit-html templates almost always need to merge in data from JavaScript values, and be able to update DOM when that data changes, they'll most often be written within functions that take some data and return a lit-html template, so that the function can be called multiple times:

```js
let myTemplate = (data) => html`
  <h1>${data.title}</h1>
  <p>${data.body}</p>`;
```

lit-html is _lazily_ rendered. Calling this function will evaluate the template literal using lit-html `html` tag, and return a `TemplateResult` - a record of the template to render and data to render it with. `TemplateResults` are very cheap to produce and no real work actually happens until they are _rendered_ to the DOM.

## Rendering

To render a `TemplateResult`, call the `render()` function with a result and DOM container to render to:

```js
const result = myTemplate({title: 'Hello', body: 'lit-html is cool'});
render(result, document.body);
```


Ready to try it yourself? Head over to [Getting Started](/guide/getting-started).

[template literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals



## What is LitElement?

LitElement is a simple base class for creating fast, lightweight web components that work in any web page with any framework.

LitElement uses [lit-html](https://lit-html.polymer-project.org/) to render into shadow DOM, and adds API to manage properties and attributes. Properties are observed by default, and elements update asynchronously when their properties change.

## What are web components?

<!-- TODO: Flesh out section -->

  * Brief overview
  * Links to MDN or webcomponents.org
* Why are web components good?
* Why should you consider web components?

## Next steps

* [Getting Started](/guide/start): Set up LitElement and create a component.
* [Templates](/guide/templates): Write templates with lit-html syntax.
* [Properties](/guide/properties): Manage properties and attributes.
* [Lifecycle](/guide/lifecycle): Work with the LitElement lifecycle API.
