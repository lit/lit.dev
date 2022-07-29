---
title: Lit SSR client API
eleventyNavigation:
  key: 🧪 Client API
  parent: Server-side rendering
  order: 3
---

## Lit Templates
"Hydration" is the process of having Lit re-associate the expressions of a Lit template with the nodes they should update in the DOM. In order to "hydrate" Lit templates, the `hydrate` method from the `experimental-hydrate` module is provided in the `lit` package. Prior to updating a server-rendered container using `render`, you should first call `hydrate` on that container using the same template and data that was used to render on the server:

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

## Lit Elements
When LitElements are server rendered, their shadow root contents are emitted inside a `<template shadowroot>`, also known as a [Declarative Shadow Root](https://web.dev/declarative-shadow-dom/), a new browser feature that is shipping in [Chrome](https://developer.chrome.com/blog/new-in-chrome-90/#declarative). Declarative shadow roots automatically attach their contents to a shadow root on the template's parent element when parsed. For browsers that do not yet implement declarative shadow root, there is a [`template-shadowroot` polyfill](https://github.com/webcomponents/template-shadowroot), described below.

Because the `hydrate` function above does not descend into shadow roots, it only works on one scope of the DOM at a time. To hydrate `LitElement` shadow roots, load the `lit/experimental-hydrate-support.js` module, which installs support for `LitElement` automatically hydrating itself when it detects it was server-rendered with declarative shadow DOM. This module should be loaded before the `lit` module is loaded, to ensure hydration support is properly installed.

Put together, an HTML page that was server rendered and containing LitElements in the main document might look like this:

```js
import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import './app-components.js';

app.use(async (ctx) => {
  const ssrResult = render(html`
    <html>
      <head>
      </head>
      <body>
        <app-shell>
          <app-page-one></app-page-one>
          <app-page-two></app-page-two>
        </app-shell>

        <script type="module">
          // Hydrate template-shadowroots eagerly after rendering (for browsers without
          // native declarative shadow roots)
          import {
            hasNativeDeclarativeShadowRoots,
            hydrateShadowRoots
          } from './node_modules/@webcomponents/template-shadowroot/template-shadowroot.js';
          if (!hasNativeDeclarativeShadowRoots) {
            hydrateShadowRoots(document.body);
          }
          // ...
          // Load and hydrate components lazily
          import('./app-components.js');
        </script>

      </body>
    </html>
  `);
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

Note that as a simple example, the code above assumes a static top-level template that does not need to be hydrated on the client, and that top-level components individually hydrate themselves using data supplied either by attributes or via a side-channel mechanism. This is in no way fundamental; the top-level template can be used to pass data to the top-level components, and that template can be loaded and hydrated on the client to apply the same data.
