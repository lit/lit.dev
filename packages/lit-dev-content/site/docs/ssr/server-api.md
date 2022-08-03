---
title: Lit SSR server API
eleventyNavigation:
  key: 🧪 Server API
  parent: Server-side rendering
  order: 2
---

<details class="pre-release">
  <summary> 🧪 Pre-release software: not for production.</summary>
  
  Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

For more information about the Lit labs process, see [Lib Labs](/docs/libraries/labs/)

</details>

Lit SSR provides two different ways of rendering custom elements server-side: rendering in the [global scope](#global-scope) or via [VM modules](#vm-module), which utilizes Node's [`vm.Module`](https://nodejs.org/api/vm.html#class-vmmodule) which enables running code within V8 Virtual Machine contexts. The two methods differ primarily in how the DOM shim is loaded.

In order to render custom elements in Node, Lit SSR includes a DOM shim that provides the minal DOM APIs necessary to render Lit on the server. (For a list of emulated APIs, see [DOM emulation](/docs/ssr/dom-emulation).)

When rendering in the global scope, this DOM shim is installed globally. This may cause unintended behaviors for other libraries. For instance, some libraries try to detect the running environment by checking for the presence of `window` in the global scope. In addition, all render requests also share the same global custom element registry, and any data that might be stored globally.

Rendering with VM modules allows each render request to have its own context with a separate global from the main Node process. DOM emulation is only installed within that context, any custom elements being registered are registered in that context, and any global data is contained within that context. VM modules are an experimental Node feature.

| Global | VM Module |
|-|-|
| Pros:<ul><li>Easy to use–can import component modules directly and call `render()` with templates.</li></ul>Cons:<ul><li>Introduces DOM shim to global scope, potentially causing issues with other libraries.</li><li>Custom elements are registered in a shared registry across different render requests.</li></ul> | Pros:<ul><li>Does not introduce DOM shim to the global scope.</li><li>Isolates contexts across different render requests.</li></ul>Cons:<ul><li>Less intuitive usage–need to write and specify a module file with a function to call.</li></ul> |

## Global Scope
The `render()` method takes a renderable value, usually a Lit template result, and returns an iterable of strings that can be streamed or concatenated to a string for a response.

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

Importing `render()` from `@lit-labs/ssr/lib/render-with-global-dom-shim.js` will also install a minimal [DOM shim](/ssr/dom-emulation) in the global scope necessary for `lit` and component definitions to be loaded for rendering the components server-side. It must be imported before any `lit` libraries or component.

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

Note: Using this feature requires Node 14+ and passing the `--experimental-vm-modules` flag to Node because of its use of experimental VM modules for creating a module-compatible VM context.
