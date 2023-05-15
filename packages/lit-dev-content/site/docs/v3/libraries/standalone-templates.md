---
title: Using lit-html standalone
eleventyNavigation:
  key: Standalone lit-html
  parent: Related libraries
  order: 1
versionLinks:
  v2: libraries/standalone-templates/
---

Lit combines the component model of LitElement with JavaScript template literal-based rendering into an easy-to-use package. However, the templating portion of Lit is factored into a standalone library called `lit-html`, which can be used outside of the Lit component model anywhere you need to efficiently render and update HTML.

## lit-html standalone package

The `lit-html` package can be installed separately from `lit`:

```sh
npm install lit-html
```

The main imports are `html` and `render`:
```js
import {html, render} from 'lit-html';
```

The standalone `lit-html` package also includes modules for the following features described in the full `Lit` developer guide:

* `lit-html/directives/*` - [Built-in directives](/docs/v3/templates/directives/)
* `lit-html/directive.js` - [Custom directives](/docs/v3/templates/custom-directives/)
* `lit-html/async-directive.js` - [Custom async directives](/docs/v3/templates/custom-directives/#async-directives)
* `lit-html/directive-helpers.js` - [Directive helpers for imperative updates](/docs/v3/templates/custom-directives/#imperative-dom-access:-update())
* `lit-html/static.js` - [Static html tag](/docs/v3/templates/expressions/#static-expressions)
* `lit-html/polyfill-support.js` - Support for interfacing with the web components polyfills (see [Styles and lit-html templates](#styles-and-lit-html-templates))

## Rendering lit-html templates

Lit templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative HTML, and may include expressions to insert and update the dynamic parts of a template (see [Templates](/docs/v3/templates/overview/) for a full reference on Lit's templating syntax).

```html
html`<h1>Hello ${name}</h1>`
```

A lit-html template expression does not cause any DOM to be created or updated. It's only a description of DOM, called a `TemplateResult`. To actually create or update DOM, you need to pass the `TemplateResult` to the `render()` function, along with a container to render to:

```js
import {html, render} from 'lit-html';

const name = 'world';
const sayHi = html`<h1>Hello ${name}</h1>`;
render(sayHi, document.body);
```

## Render dynamic data

To make your template dynamic, you can create a _template function_. Call the template function any time your data changes.

```js
import {html, render} from 'lit-html';

// Define a template function
const myTemplate = (name) => html`<div>Hello ${name}</div>`;

// Render the template with some data
render(myTemplate('earth'), document.body);

// ... Later on ...
// Render the template with different data
render(myTemplate('mars'), document.body);
```

When you call the template function, lit-html captures the current expression values. The template function doesn't create any DOM nodes, so it's fast and cheap.

The template function returns a `TemplateResult` that contains the template and the input data. This is one of the main principles behind using lit-html: **creating UI as a _function_ of state**.

When you call `render`, **lit-html only updates the parts of the template that have changed since the last render.** This makes lit-html updates very fast.

### Render Options

The `render` method also takes an `options` argument that allows you to specify the following options:

*   `host`: The `this` value to use when invoking event listeners registered with the `@eventName` syntax. This option only applies when you specify an event listener as a plain function. If you specify the event listener using an event listener object, the listener object is used as the `this` value. See [Event listener expressions](/docs/v3/templates/expressions/#event-listener-expressions) for more on event listeners.

*   `renderBefore`: An optional reference node within the `container` before which lit-html will render. By default, lit-html will append to the end of the container. Setting `renderBefore` allows rendering to a specific spot within the container.

*   `creationScope`: The object lit-html will call `importNode` on when cloning templates (defaults to `document`). This is provided for advanced use cases.

For example, if you're using `lit-html` standalone, you might use render options like this:

```html
<div id="container">
  <header>My Site</header>
  <footer>Copyright 2021</footer>
</div>
```

```ts
const template = () => html`...`;
const container = document.getElementById('container');
const renderBefore = container.querySelector('footer');
render(template(), container, {renderBefore});
```

The above example would render the template between the `<header>` and `<footer>` elements.

<div class="alert alert-info">

**Render options must be constant.** Render options should *not* change between subsequent `render` calls.

</div>

## Styles and lit-html templates

lit-html focuses on one thing: rendering HTML. How you apply styles to the HTML lit-html creates depends on how you're using it—for example, if you're using lit-html inside a component system like LitElement, you can follow the patterns used by that component system.

In general, how you style HTML will depend on whether you're using shadow DOM:

*   If you are not rendering into shadow DOM, you can style HTML using global style sheets.
*   If are rendering into shadow DOM, then you can render `<style>` tags inside the shadow root.

<div class="alert alert-info">

**Styling shadow roots on legacy browsers requires polyfills.** Using the [ShadyCSS](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss) polyfill with standalone `lit-html` requires loading `lit-html/polyfill-support.js` and passing a `scope` option in `RenderOptions` with the host tag name for scoping the rendered content. Although this approach is possible, we recommend using [LitElement](/docs/v3/components/overview/) if you want to support rendering lit-html templates to shadow DOM on legacy browsers.

</div>

To help with dynamic styling, lit-html provides two directives for manipulating an element's `class` and `style` attributes:

*   [`classMap`](/docs/v3/templates/directives/#classmap) sets classes on an element based on the properties of an object.
*   [`styleMap`](/docs/v3/templates/directives/#stylemap) sets the styles on an element based on a map of style properties and values.
