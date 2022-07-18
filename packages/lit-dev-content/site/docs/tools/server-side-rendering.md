---
title: Server-side Rendering
eleventyNavigation:
  key: Server-side rendering
  parent: Tools
  order: 9
---

Server-side rendering (SSR) Lit templates and elements is possible with the [`@lit-labs/ssr`](/docs/libraries/labs/) package. As with all `@lit-labs` packages, it is considered experimental and not ready for production use but we encourage you to try it out and file any issues for bugs or feature requests.

## SSR Methods
The following methods of rendering are provided by `@lit-labs/ssr` for rendering Lit elements and templates on the server.

### Global Scope
The `render` method takes a renderable value, usually a Lit template result, and returns an interable of strings that can be streamed or concatenated to a string for a response.

```js
import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import {myTemplate} from './my-template.js';

// ...

// within a Koa middleware, for example
app.use(async (ctx) => {
  const ssrResult = render(myTemplate(data));
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

Importing `render` from `@lit-labs/ssr/lib/render-with-global-dom-shim.js` will also install a minimal [DOM Shim](#dom-shim) in the global scope necessary for `lit` and component definitions to be loaded for rendering the components server-side. It must be imported before any `lit` libraries or component

Note: Loading the DOM shim globally introduces `window` into the global space which some libraries might look for in determining whether the code is running in a browser environment. If this becomes an issue, consider using SSR with [VM Module](#vm-module) instead.

### VM Module
We also provide a way to load application code into, and render from, a separate VM context with its own global object.

```js
// render-template.js
import {render} from '@lit-labs/ssr/lib/render-lit-html.js';
import {myTemplate} from './my-template.js';

export const renderTemplate = (someData) => {
  return render(myTemplate(someData));
};
```

```js
// server.js
import {renderModule} from '@lit-labs/ssr/lib/render-module.js';

// ...

// within a Koa middleware, for example
app.use(async (ctx) => {
  const ssrResult = await renderModule(
    './render-template.js',  // Module to load in VM context
    import.meta.url,         // Referrer URL for module
    'renderTemplate',        // Function to call
    [{some: "data"}]         // Arguments to function
  );
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

Note: Using this feature requires Node 14+ and passing the `--experimental-vm-modules` flag to node because of its use of experimental VM modules for creating a module-compatible VM context.

## Hydration

### Lit Templates
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

### Lit Elements
When LitElements are server rendered, their shadow root contents are emitted inside a `<template shadowroot>`, also known as a [Declarative Shadow Root](https://web.dev/declarative-shadow-dom/), a new browser feature that is shipping [Chrome](https://developer.chrome.com/blog/new-in-chrome-90/#declarative). Declarative shadow roots automatically attach their contents to a shadow root on the template's parent element when parsed. For browsers that do not yet implement declarative shadow root, there is a [`template-shadowroot` polyfill](https://github.com/webcomponents/template-shadowroot), described below.

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

## DOM Shim

Only the minimal DOM interfaces needed for `lit-html` and `LitElement` to boot are implemented, which are mostly base classes for extension, and a roughly functioning `CustomElementRegistry`.

Below lists all the properties, classes, and methods on the `window` object added to `globalThis`. The contents of `window` are also assigned onto `globalThis`. ✅ signifies item is implemented to be functionally the same as in the browser.

| Property | Notes |
|-|-|
| `Element` | ⚠️ Empty class |
| `HTMLElement` | ⚠️ Partial <table><tbody><tr><td>`attributes`</td><td>✅</td><tr><td>`shadowRoot`</td><td>✅</td><tr><td>`setAttribute()`</td><td>✅</td><tr><td>`removeAttribute()`</td><td>✅</td><tr><td>`hasAttribute()`</td><td>✅</td><tr><td>`attachShadow()`</td><td>✅</td><tr><td>`getAttribute()`</td><td>✅</td></tr></tbody></table> |
| `Document` | ⚠️ Partial <table><tbody><tr><td>`adoptedStyleSheets`</td><td>⚠️ Getter only returning `[]`</td><tr><td>`createTreeWalker()`</td><td>⚠️ Returns `{}`</td><tr><td>`createTextNode()`</td><td>⚠️ Returns `{}`</td><tr><td>`createElement()`</td><td>⚠️ Returns `{}`</td></tr></tbody></table> |
| `document` | Instance of `Document` |
| `cssStyleSheet` | ⚠️ Partial <table><tbody><tr><td>`replace()`</td><td>⚠️ No op</td></tr></tbody></table> |
| `ShadowRoot` | ⚠️ Empty class |
| `CustomElementRegistry` | <table><tbody><tr><td>`define()`</td><td>✅</td></tr><tr><td>`get()`</td><td>✅</td></tr></tbody></table> |
| `customElements` | Instance of `CustomElementRegistry` |
| `btoa()` | ✅ |
| `fetch()` | `node-fetch` |
| `location` | `new URL('http://localhost')` |
| `MutationObserver` | ⚠️ Partial <table><tbody><tr><td>`observe()`</td><td>⚠️ No op</td></tr></tbody></table> |
| `requestAnimationFrame()` | ⚠️ No op |
| `window` | ✅ Self reference |



## Lifecycle

The table below lists the standard custom element and Lit element lifecycle methods and whether they are called during SSR and during hydration.

Be mindful that methods called on the server should not contain references to browser/DOM APIs that have not been shimmed. Methods that are not called server-side may contain those references without throwing.

### LitElement
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `copnnectedCallback()` | ❌ | ✅ | Currently not called on SSR but may be subject to change. |
| `disconnectedCallback()` | ❌ | ❌ | |
| `attributeChangedCallback()` | ❌ | ✅ | No reactivity in SSR |
| `adoptedCallback()` | ❌ | ❌ | |
| `hasChanged()` | ✅ | ✅ | Called when property is set for initial SSR. |
| `shouldUpdate()` | ❌ | ✅ | |
| `willUpdate()` | ✅ | ✅ | Called before `render()` in SSR. |
| `update()` | ❌ | ✅ | |
| `render()` | ✅ | ✅ | |
| `firstUpdate()` | ❌ | ✅ | |
| `updated()` | ❌ | ✅ | |

### ReactiveController
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `hostConnected()` | ❌ | ✅ | |
| `hostDisconnected()` | ❌ | ❌ | |
| `hostUpdate()` | ❌ | ✅ | No reactivity in SSR |
| `hostUpdated()` | ❌ | ✅ | No reactivity in SSR |

### Directive
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `update()` | ❌ | ✅ | |
| `render()` | ✅ | ⚠️ | On hydration, `render()` won't be explicitly called but the default `update()` method, if not overridden, will call and return the result of `render()` |
| `disconnected()` | ❌ | ❌ | Async directives only |
| `reconnected()` | ❌ | ❌ | Async directives only |

## Other considerations

### Modules with side effects

Some component modules might have either within them or somewhere in the module tree some side effects that rely on browser APIs, for instance, to check for presence of browser features or pre-instantiating a `DOMParser`. These will cause errors during server rendering.

### Asynchronicity

Current Lit SSR implementation will only render synchronous results and yield them immediately, which can then be streamed out without an opportunity for asynchronous updates to change what was already streamed out.

For example
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

There currently aren't any mechanisms to wait for some asynchronous result before continuing to render yet, though we are considering options. Current work around for this is to do any asynchronous work before calling `render()` and providing it to the template as some attribute or property.

## Testing

`@lit-labs/testing` package contains utility functions that utilize a Web Test Runner plugin to create test fixtures that are rendered server-side using `@lit-labs/ssr`. It can help test whether your components are server-side renderable. See more in the [readme](https://github.com/lit/lit/tree/main/packages/labs/testing#readme).
