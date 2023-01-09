---
title: Lit SSR server usage
eleventyNavigation:
  key: Server usage
  parent: Server rendering
  order: 2
---

{% labs-disclaimer %}

In order to render custom elements in Node, they must first be defined and registered with the global `customElements` API, which is a browser-only feature. As such, when Lit runs in Node, it automatically uses a set of minimal DOM APIs necessary to render Lit on the server, and defines the `customElements` global. (For a list of emulated APIs, see [DOM emulation](/docs/ssr/dom-emulation).)

Lit SSR provides two different ways of rendering custom elements server-side: rendering in the [global scope](#global-scope) or via [VM modules](#vm-module). VM modules utilizes Node's [`vm.Module`](https://nodejs.org/api/vm.html#class-vmmodule) API, which enables running code within V8 Virtual Machine contexts. The two methods differ primarily in how global state, such as the custom elements registry, are shared.

When rendering in the global scope, a single shared `customElements` registry will be defined and shared across all render requests, along with any other global state that your component code might set.

Rendering with VM modules allows each render request to have its own context with a separate global from the main Node process. The `customElements` registry will only be installed within that context, and other global state will also be isolated to that context. VM modules are an experimental Node feature.

| Global                                                                                                                                                                                                                    | VM Module                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pros:<ul><li>Easy to use. Can import component modules directly and call `render()` with templates.</li></ul>Cons:<ul><li>Custom elements are registered in a shared registry across different render requests.</li></ul> | Pros:<ul><li>Isolates contexts across different render requests.</li></ul>Cons:<ul><li>Less intuitive usage. Need to write and specify a module file with a function to call.</li><li>Slower due the module graph needing to be re-evaluated per request.</li></ul> |

## Global Scope

The `render()` method takes a renderable value, usually a Lit template result, and returns an iterable of strings that can be streamed or concatenated to a string for a response.

```js
import {render} from '@lit-labs/ssr';
import {myTemplate} from './my-template.js';

// ...

// within a Koa middleware, for example
app.use(async (ctx) => {
  const ssrResult = render(myTemplate(data));
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

## VM Module

Lit also provide a way to load application code into, and render from, a separate VM context with its own global object.

```js
// render-template.js
import {render} from '@lit-labs/ssr/lib/render-lit-html.js';
import {myTemplate} from './my-template.js';

export const renderTemplate = (someData) => {
  return render(myTemplate(someData));
};
```

{% switchable-sample %}

```ts
// server.js
import {ModuleLoader} from '@lit-labs/ssr/lib/module-loader.js';

// ...

// within a Koa middleware, for example
app.use(async (ctx) => {
  const moduleLoader = new ModuleLoader();
  const importResult = await moduleLoader.importModule(
    './render-template.js',  // Module to load in VM context
    import.meta.url          // Referrer URL for module
  );
  const {renderTemplate} = importResult.module.namespace
    as typeof import('./render-template.js')
  const ssrResult = await renderTemplate({some: "data"});
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

```js
// server.js
import {ModuleLoader} from '@lit-labs/ssr/lib/module-loader.js';

// ...

// within a Koa middleware, for example
app.use(async (ctx) => {
  const moduleLoader = new ModuleLoader();
  const importResult = await moduleLoader.importModule(
    './render-template.js',  // Module to load in VM context
    import.meta.url          // Referrer URL for module
  );
  const {renderTemplate} = importResult.module.namespace;
  const ssrResult = await renderTemplate({some: "data"});
  ctx.type = 'text/html';
  ctx.body = Readable.from(ssrResult);
});
```

{% endswitchable-sample %}

Note: Using this feature requires Node 14+ and passing the `--experimental-vm-modules` flag to Node because of its use of experimental VM modules for creating a module-compatible VM context.
