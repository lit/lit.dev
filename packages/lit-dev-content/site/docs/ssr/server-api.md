---
title: Servber-side rendering server API
eleventyNavigation:
  key: Server API
  parent: Server-side rendering
  order: 2
---

Lit SSR provides a couple different ways of rendering custom elements server-side: rendering in the [global scope](#global-scope) or via [VM modules](#vm-module).

In order to render custom elements in Node, Lit SSR requires some minimal [DOM emulation]('/docs/ssr/dom-emulation') necessary for `lit-html` and `reactive-element` to work, as well as a working `CustomElementRegistry`.

When rendering in the global scope, this DOM shim is installed in the global space, which may cause unintended behaviors for other libraries which might try to detect the running environment by checking for the presence of `window` in the global space, for instance. All render requests also share the same global custom element registry, and any data that might be stored globally.

Rendering with VM modules allow each render request to have its own context with a separate global from the main Node process such that the DOM emulation is only installed within that scope and any custom elements being registered or global data is contained within that context used only for that particular render request. It does require utilizing an experimental node feature with a particular way of using it. See below for details.

## Global Scope
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

## VM Module
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
