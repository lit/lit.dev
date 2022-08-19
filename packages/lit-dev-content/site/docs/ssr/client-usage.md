---
title: Lit SSR client usage
eleventyNavigation:
  key: Client usage
  parent: Server rendering
  order: 3
---

{% labs-disclaimer %}

Lit SSR generates static HTML for the browser to parse and paint without any JavaScript. (Browsers that do not have support for Declarative Shadow DOM will require some JavaScript polyfill for Lit components authored to utilize the Shadow DOM.) For pages with static content, this is all that's needed. However, if the page content needs to be dynamic and respond to user interactions, it will need JavaScript to re-apply that reactivity.

How to re-apply that reactivity client-side depends on whether you are rendering standalone Lit templates or utilizing Lit components.

## Standalone Lit Templates
"Hydration" for Lit templates is the process of having Lit re-associate the expressions of a Lit templates with the nodes they should update in the DOM as well as adding event listeners. In order to hydrate Lit templates, the `hydrate()` method from the `experimental-hydrate` module is provided in the `lit` package. Before you update a server-rendered container using `render()`, you must first call `hydrate()` on that container using the same template and data that was used to render on the server:

```js
import {render} from 'lit';
import {hydrate} from 'lit/experimental-hydrate.js';
import {myTemplate} from './my-template.js';
// Initial hydration required before render:
// (must be same data used to render on the server)
const initialData = getInitialAppData();
hydrate(myTemplate(initialData), document.body);

// After hydration, render will efficiently update the server-rendered DOM:
const update = (data) => render(myTemplate(data), document.body);
```

## Lit components
To re-apply reactivity to Lit components, the custom element definition needs to be loaded for them to be upgraded, enabling their lifecycle callbacks, and the templates in the components' shadow roots needs to be hydrated.

Upgrading can be achieved simply by loading the component module that registers the custom element. This can be done by loading a bundle of all the component definitions for a page, or may be done based on more sophisticated heuristics where only a subset of definitions are loaded as needed. To ensure templates in `LitElement` shadow roots are hydrated, load the `lit/experimental-hydrate-support.js` module which installs support for `LitElement` to automatically hydrate itself when it detects it was server-rendered with declarative shadow DOM. This module must be loaded before the `lit` module, and therefore any component modules that import `lit`, is loaded to ensure hydration support is properly installed.

When Lit components are server rendered, their shadow root contents are emitted inside a `<template shadowroot>`, also known as a [Declarative Shadow Root](https://web.dev/declarative-shadow-dom/). Declarative shadow roots automatically attach their contents to a shadow root on the template's parent element when HTML is parsed without the need for JavaScript.

Until all browsers include declarative shadow DOM support, a very small polyfill is available that can be inlined into your page. This lets you use SSR now for any browsers and crawlers with JavaScript enabled and incrementally address non-JavaScript use cases as the feature is rolled out to the rest of the browsers and crawlers. The usage of the [`template-shadowroot` polyfill](https://github.com/webcomponents/template-shadowroot) is included in the example below.

Put together, an HTML page that was server rendered and containing Lit components in the main document might look like this:

```js
import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import {html} from 'lit';
import './app-shell.js';
import './app-page-one.js';
import './app-page-two.js';

function* renderApp() {
  yield `
    <!DOCTYPE html>
    <html>
      <head>
        <!-- As an optimization, immediately begin fetching the JavaScript modules
            that we know for sure we'll eventually need. It's important we don't
            execute them yet, though. -->
        <link
          rel="modulepreload"
          href="/node_modules/lit/experimental-hydrate-support.js"
        />
        <link rel="modulepreload" href="/app-shell.js" />
        <link rel="modulepreload" href="/app-page-one.js" />
        <link rel="modulepreload" href="/app-page-two.js" />

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
  `;
  // Below will be pre-rendered with declarative shadow DOM
  yield* render(html`
        <app-shell>
          <app-page-one></app-page-one>
          <app-page-two></app-page-two>
        </app-shell>
  `);
  yield `
        <!-- Use a type=module script so that we can use dynamic module imports.
            Note this pattern will not work in IE11. -->
        <script type="module">
          // Start fetching the Lit hydration support module (note the absence
          // of "await" -- we don't want to block yet).
          const litHydrateSupportInstalled = import(
            '/node_modules/lit/experimental-hydrate-support.js'
          );

          // Check if we require the declarative shadow DOM polyfill. As of
          // August 2022, Chrome and Edge have native support, but Firefox
          // and Safari don't yet.
          if (!HTMLTemplateElement.prototype.hasOwnProperty('shadowRoot')) {
            // Fetch the declarative shadow DOM polyfill.
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

          // The Lit hydration support module must be installed before we can
          // load any component definitions. Wait until it's ready.
          await litHydrateSupportInstalled;

          // Load component definitions. As each component definition loads, your
          // pre-rendered components will come to life and become interactive.
          //
          // You may also prefer to bundle your components into fewer JS modules.
          // See https://lit.dev/docs/tools/production/#building-with-rollup for
          // more details.
          import('/app-shell.js');
          import('/app-page-one.js');
          import('/app-page-two.js');
        </script>
      </body>
    </html>
  `
}

app.use(async (ctx) => {
  const ssrResult = renderApp();
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```
