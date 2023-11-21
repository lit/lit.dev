---
title: Lit SSR client usage
eleventyNavigation:
  key: Client usage
  parent: Server rendering
  order: 3
versionLinks:
  v2: ssr/client-usage/
---

{% labs-disclaimer %}

Lit SSR generates static HTML for the browser to parse and paint without any JavaScript. (Browsers that do not have support for Declarative Shadow DOM will require some JavaScript polyfill for Lit components authored to utilize the Shadow DOM.) For pages with static content, this is all that's needed. However, if the page content needs to be dynamic and respond to user interactions, it will need JavaScript to re-apply that reactivity.

How to re-apply that reactivity client-side depends on whether you are rendering standalone Lit templates or utilizing Lit components.

## Standalone Lit Templates
"Hydration" for Lit templates is the process of having Lit re-associate the expressions of Lit templates with the nodes they should update in the DOM as well as adding event listeners. In order to hydrate Lit templates, the `hydrate()` method is provided in the `@lit-labs/ssr-client` package. Before you update a server-rendered container using `render()`, you must first call `hydrate()` on that container using the same template and data that was used to render on the server:

```js
import {render} from 'lit';
import {hydrate} from '@lit-labs/ssr-client';
import {myTemplate} from './my-template.js';
// Initial hydration required before render:
// (must be same data used to render on the server)
const initialData = getInitialAppData();
hydrate(myTemplate(initialData), document.body);

// After hydration, render will efficiently update the server-rendered DOM:
const update = (data) => render(myTemplate(data), document.body);
```

## Lit components
To re-apply reactivity to Lit components, custom element definitions need to be loaded for them to upgrade, enabling their lifecycle callbacks, and the templates in the components' shadow roots needs to be hydrated.

Upgrading can be achieved simply by loading the component module that registers the custom element. This can be done by loading a bundle of all the component definitions for a page, or may be done based on more sophisticated heuristics where only a subset of definitions are loaded as needed. To ensure templates in `LitElement` shadow roots are hydrated, load the `@lit-labs/ssr-client/lit-element-hydrate-support.js` module which installs support for `LitElement` to automatically hydrate itself when it detects it was server-rendered with declarative shadow DOM. This module must be loaded before the `lit` module is loaded (including any component modules that import `lit`) to ensure hydration support is properly installed.

When Lit components are server rendered, their shadow root contents are emitted inside a `<template shadowroot>`, also known as a [Declarative Shadow Root](https://web.dev/declarative-shadow-dom/). Declarative shadow roots automatically attach their contents to a shadow root on the template's parent element when HTML is parsed without the need for JavaScript.

Until all browsers include declarative shadow DOM support, a very small polyfill is available that can be inlined into your page. This lets you use SSR now for any browsers with JavaScript enabled and incrementally address non-JavaScript use cases as the feature is rolled out to other browsers. The usage of the [`template-shadowroot` polyfill](https://github.com/webcomponents/template-shadowroot) is described below.

### Loading `@lit-labs/ssr-client/lit-element-hydrate-support.js`
This needs to be loaded before any component modules and the `lit` library.

For example:
```html
  <body>
    <!-- App components rendered with declarative shadow DOM placed here. -->

    <!-- ssr-client lit-element-hydrate-support should be loaded first. -->
    <script type="module" src="/node_modules/@lit-labs/ssr-client/lit-element-hydrate-support.js"></script>

    <!-- As component definition loads, your pre-rendered components will
        come to life and become interactive. -->
    <script src="/app-components.js"></script>
  </body>
```

If you are [bundling](/docs/v2/tools/production/) your code, make sure the `@lit-labs/ssr-client/lit-element-hydrate-support.js` is imported first:
```js
// index.js
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import './app-components.js';
```

### Using the `template-shadowroot` polyfill
The HTML snippet below includes an optional strategy to hide the body until the polyfill is loaded to prevent layout shifts.

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- On browsers that don't yet support native declarative shadow DOM, a
        paint can occur after some or all pre-rendered HTML has been parsed,
        but before the declarative shadow DOM polyfill has taken effect. This
        paint is undesirable because it won't include any component shadow DOM.
        To prevent layout shifts that can result from this render, we use a
        "dsd-pending" attribute to ensure we only paint after we know
        shadow DOM is active. -->
    <style>
      body[dsd-pending] {
        display: none;
      }
    </style>
  </head>

  <body dsd-pending>
    <script>
      if (HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
        // This browser has native declarative shadow DOM support, so we can
        // allow painting immediately.
        document.body.removeAttribute('dsd-pending');
      }
    </script>

    <!-- App components rendered with declarative shadow DOM placed here. -->

    <!-- Use a type=module script so that we can use dynamic module imports.
        Note this pattern will not work in IE11. -->
    <script type="module">
      // Check if we require the template shadow root polyfill.
      if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
        // Fetch the template shadow root polyfill.
        const {hydrateShadowRoots} = await import(
          '/node_modules/@webcomponents/template-shadowroot/template-shadowroot.js'
        );

        // Apply the polyfill. This is a one-shot operation, so it is important
        // it happens after all HTML has been parsed.
        hydrateShadowRoots(document.body);

        // At this point, browsers without native declarative shadow DOM
        // support can paint the initial state of your components!
        document.body.removeAttribute('dsd-pending');
      }
    </script>
  </body>
</html>
```

### Combined example
This example shows a strategy that combines both the `@lit-labs/ssr-client/lit-element-hydrate-support.js` and the `template-shadowroot` polyfill loading and serves a page with a SSRed component to hydrate client-side.

[Lit SSR in a Koa server](https://stackblitz.com/edit/lit-ssr-global?file=src/server.js)
