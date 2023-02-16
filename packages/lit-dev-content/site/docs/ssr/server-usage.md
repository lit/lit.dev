---
title: Lit SSR server usage
eleventyNavigation:
  key: Server usage
  parent: Server rendering
  order: 2
---

{% labs-disclaimer %}

## Rendering templates

Server rendering begins with rendering a Lit _template_ with a server-specific `render()` function provided in the `@lit-labs/ssr` package.

The signature of the render function is:

```ts
render(value: unknown, renderInfo?: Partial<RenderInfo>): RenderResult
```

Typically `value` is a TemplateResult produced by a Lit template expression, like:

```ts
html`<h1>Hello</h1>`
```

The template can contain custom elements, which are rendered in turn, along with their templates.

```ts
import {render} from '@lit-labs/ssr';

const result = render(html`
  <h1>Hello SSR!</h1>
  <my-element></my-element>
`);
```

To render a single element, you render a template that only contains that element:

```ts
const result = render(html`<my-element></my-element>`);
```

### Handling RenderResults

`render()` returns a `RenderResult`: an iterable of values that can be streamed or concatenated into a string.

A `RenderResult` can contain strings, nested render results, or Promises of strings or render results. Not all render results contain Promises—those can occur when custom elements perform async tasks, like fetching data—but because a `RenderResult` can contain Promises, processing it into a string or an HTTP response is _potentially_ an async operation.

Even though a `RenderResult` can contain Promises, it is still a sync iterable, not an async iterable. This is because sync iterables are faster than async iterables and many server renders will not require async rendering, and so shouldn't pay the overhead of an async iterable.

Allowing Promises in a sync iterable creates a kind of hybrid sync / async iteration protocol. When consuming a `RenderResult`, you must check each value to see if it is a Promise or iterable and wait or recurse as needed.

`@lit-labs/ssr` contains three utilities to do this for you:

- `RenderResultReadable`
- `collectResult()`
- `collectResultSync()`

#### `RenderResultReadable`

`RenderResultReadable` is a Node `Readable` stream implementation that provides values from a `RenderResult`. This can be piped into a `Writable` stream, or passed to web server frameworks like Koa.

This is the preferred way to handle SSR results when integrating with a streaming HTTP server or other stream-supprting API.

```ts
import {render} from '@lit-labs/ssr';
import {RenderResultReadable} from '@lit-labs/ssr/lib/render-result-readable.js';

// Using Koa to stream
app.use(async (ctx) => {
  const result = render(html`<my-element></my-element>`);
  ctx.type = 'text/html';
  ctx.body = new RenderResultReadable(result);
});
```

#### `collectResult()`

`collectResult(result: RenderResult): Promise<string>`

`collectResult()` is an async function that takes a `RenderResult` and joins it into a string. It waits for Promises and recurses into nested iterables.

##### Example
```ts
import {render} from '@lit-labs/ssr';
import {collectResult} from '@lit-labs/ssr/lib/render-result.js';

const result = render(html`<my-element></my-element>`);
const html = await collectResult(result);
```

#### `collectResultSync()`

`collectResultSync(result: RenderResult): Promise<string>`

`collectResultSync()` is a sync function that takes a `RenderResult` and joins it into a string. It recurses into nested iterables, but _throws_ when it encounters a Promise.

Because this function doesn't support async rendering, it's recommended to only use it when you can't await async functions.

```ts
import {render} from '@lit-labs/ssr';
import {collectResultSync} from '@lit-labs/ssr/lib/render-result.js';

const result = render(html`<my-element></my-element>`);
// Throws if `result` contains a Promise!
const html = collectResultSync(result);
```

### Render options

The second argument to `render()` is a `RenderInfo` object that is used to pass options and current render state to components and sub-templates.

The main options that can be set by callers are:

* `deferHydration`: controls whether the top-level custom elements have a `defer-hydration` attribute added to signal that the elements should not automatically hydrate. This defaults to `false` so that top-level elements _do_ automatically hydrate.
* `elementRenderers`: An array of `ElementRenderer` classes to use for rendering custom elements. By default this contains `LitElementRenderer` to render Lit elements. It can be set to include custom `ElementRenderer` instances (documentation forthcoming), or set to an empty array to disable custom element rendering altogether.

## Running SSR in a VM module or the global scope

In order to render custom elements in Node, they must first be defined and registered with the global `customElements` API, which is a browser-only feature. As such, Lit SSR includes a DOM shim that provides the minimal DOM APIs necessary to render Lit on the server. (For a list of emulated APIs, see [DOM emulation](/docs/ssr/dom-emulation).)

Lit SSR provides two different ways of rendering custom elements server-side: rendering in the [global scope](#global-scope) or via [VM modules](#vm-module). VM modules utilizes Node's [`vm.Module`](https://nodejs.org/api/vm.html#class-vmmodule) API, which enables running code within V8 Virtual Machine contexts. The two methods differ primarily in how the DOM shim is loaded.

When rendering in the global scope, shimmed DOM globals (like `window`, `HTMLElement`, `customElements`, etc.) are added directly to the Node.js global scope. This may cause unintended behaviors for other libraries. For instance, some libraries try to detect the running environment by checking for the presence of `window` in the global scope. In addition, all render requests also share the same global custom element registry, and any data that might be stored globally.

Rendering with VM modules allows each render request to have its own context with a separate global from the main Node process. DOM emulation is only installed within that context, any custom elements being registered are registered in that context, and any global data is contained within that context. VM modules are an experimental Node feature.

| Global | VM Module |
|-|-|
| Pros:<ul><li>Easy to use. Can import component modules directly and call `render()` with templates.</li></ul>Cons:<ul><li>Introduces DOM shim to global scope, potentially causing issues with other libraries.</li><li>Custom elements are registered in a shared registry across different render requests.</li></ul> | Pros:<ul><li>Does not introduce DOM shim to the global scope.</li><li>Isolates contexts across different render requests.</li></ul>Cons:<ul><li>Less intuitive usage. Need to write and specify a module file with a function to call.</li><li>Slower due the module graph needing to be re-evaluated per request.</li></ul> |

### Global Scope

When using the global scope, you can just call `render()` with a template to get a `RenderResult` and pass that to your server:

```js
import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
import {RenderResultReadable} from '@lit-labs/ssr/lib/render-result-readable.js';
import {myTemplate} from './my-template.js';

// within a Koa middleware, for example
app.use(async (ctx) => {
  const ssrResult = render(myTemplate(data));
  ctx.type = 'text/html';
  ctx.body = new RenderResultReadable(ssrResult);
});
```

Using the global scope requires patching a minimal [DOM shim](/docs/ssr/dom-emulation) onto `globalThis` which is necessary for `lit` and component definitions to be loaded in Node. It must be imported before any `lit` libraries or component.

There are three ways to load the global DOM shim:

* Manual installation

  The `lib/dom-shim.js` module exports a `installWindowOnGlobal()` function that installs the shim.

  ```ts
  import {installWindowOnGlobal} from '@lit-labs/ssr/lib/dom-shim.js';
  installWindowOnGlobal();
  ```

* Automatic installation

  The `lib/install-global-dom-shim.js` module automatically installs the shim as a side-effect, so you only need to import it:

  ```ts
  import '@lit-labs/ssr/lib/install-global-dom-shim.js';
  ```

* Automatic installation with a `render` export

  The `@lit-labs/ssr/lib/render-with-global-dom-shim.js` module automatically installs the DOM shim and exports `render` so that you only need one import to render a template:

  ```ts
  import {render} from '@lit-labs/ssr/lib/render-with-global-dom-shim.js';
  ```

Note: Loading the DOM shim globally introduces `window` into the global scope. Some libraries might use the presence of `window` to determine whether the code is running in a browser environment. If this becomes an issue, consider using SSR with [VM Module](#vm-module) instead.

### VM Module
Lit also provide a way to load application code into, and render from, a separate VM context with its own global object.

```js
// render-template.js
import {render} from '@lit-labs/ssr';
import {myTemplate} from './my-template.js';

export const renderTemplate = (someData) => {
  return render(myTemplate(someData));
};
```

```js
// server.js
import {renderModule} from '@lit-labs/ssr/lib/render-module.js';
import {RenderResultReadable} from '@lit-labs/ssr/lib/render-result-readable.js';

// within a Koa middleware, for example
app.use(async (ctx) => {
  const ssrResult = await renderModule(
    './render-template.js',  // Module to load in VM context
    import.meta.url,         // Referrer URL for module
    'renderTemplate',        // Function to call
    [{some: "data"}]         // Arguments to function
  );
  ctx.type = 'text/html';
  ctx.body = new RenderResultReadable(ssrResult);
});
```

Note: Using this feature requires Node 14+ and passing the `--experimental-vm-modules` flag to Node because of its use of experimental VM modules for creating a module-compatible VM context.
