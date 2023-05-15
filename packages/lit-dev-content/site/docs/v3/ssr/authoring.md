---
title: Authoring components for Lit SSR
eleventyNavigation:
  key: Authoring components
  parent: Server rendering
  order: 4
versionLinks:
  v2: ssr/authoring/
---

{% labs-disclaimer %}

Lit's approach to rendering web components in a server environment places some restrictions on component code to achieve efficient server rendering. When authoring components, keep in mind these considerations to ensure they are compatible with Lit SSR.

Note: The restrictions listed on this page are subject to change as we make improvements to Lit SSR. If you would like to see a certain use case supported, please [file an issue](https://github.com/lit/lit/issues/new/choose) or start a [discussion](https://github.com/lit/lit/discussions) thread.

## Browser-only code

Most browser DOM APIs are not available in the Node environment. Lit SSR utilizes a DOM shim that's the bare minimum required for rendering Lit templates and components. For a full list of what APIs are available, see the [DOM Emulation](/docs/v3/ssr/dom-emulation) page.

When authoring components, perform imperative DOM operations from lifecycle methods that are called **only on the client**, and not on the server. For example, use `updated()` if you need to measure the updated DOM. This callback is only run on the browser, so it is safe to access the DOM.

See the [lifecycle](#lifecycle) section below for a list of which specific methods are called on the server and which are browser-only.

Some modules that define Lit components may also have side effects that use browser APIs—for example to detect certain browser features—such that the module breaks when imported in a non-browser environment. In this case, you can move the side effect code into a browser-only lifecycle callback, or conditionalize so that it only runs on the browser.

For simple cases, adding conditionals or optional chaining to certain DOM accesses may be sufficient to guard against unavailable DOM APIs. For example:

```js
const hasConstructableStylesheets = typeof globalThis.CSSStyleSheet?.prototype.replaceSync === 'function';
```

The `lit` package also provides an `isServer` environment checker that can be used to write conditional blocks of code targeting different environments:

```js
import {isServer} from 'lit';

if (isServer) {
  // only runs in server environments like Node
} else {
  // runs in the browser
}
```

For more complex uses cases, consider utilizing [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) in Node that specifically match for `"node"` environments so you could have different code depending on whether the module is being imported for use in Node or in the browser. Users would get the appropriate version of the package depending on whether it was imported from Node or the browser. Export conditions are also supported by popular bundling tools like [rollup](https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions) and [webpack](https://webpack.js.org/configuration/resolve/#resolveconditionnames) so users can bring in the appropriate code for your bundle.

{% aside "warn" %}

Don't bundle Lit into published components.

Because Lit packages use conditional exports to provide different modules to Node and browser environments, we strongly discourage bundling `lit` into your packages being published to NPM. If you do, your bundle will only include `lit` modules meant for the environment you bundled, and won't automatically switch based on environment.

{% endaside %}

## Lifecycle

Only certain lifecycle callbacks are run during server-side rendering. These callback generate the initial styling and markup for the component. Additional lifecycle methods are called client-side during hydration and during runtime after the components are hydrated.

The tables below lists the standard custom element and Lit lifecycle methods and whether they are called during SSR. All of the lifecycle is available on the browser after element registration and hydration.

{% aside "warn" "no-header" %}

Methods called on the server should not contain references to browser/DOM APIs that have not been shimmed. Methods that are not called server-side may contain those references without causing breakages.

{% endaside %}

{% aside "labs" "no-header" %}

Whether a method is called on the server is subject to change while Lit SSR is part of Lit Labs.

{% endaside %}

<!-- TODO(augustinekim) Replace emoji with appropriate icon -->
### Standard custom element and LitElement
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | Yes ⚠️ | |
| `connectedCallback()` | No | |
| `disconnectedCallback()` | No | |
| `attributeChangedCallback()` | No | |
| `adoptedCallback()` | No | |
| `hasChanged()` | Yes ⚠️ | Called when property is set |
| `shouldUpdate()` | No | |
| `willUpdate()` | Yes ⚠️ | Called before `render()` |
| `update()` | No | |
| `render()` | Yes ⚠️ | |
| `firstUpdate()` | No | |
| `updated()` | No | |

### ReactiveController
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | Yes ⚠️ | |
| `hostConnected()` | No | |
| `hostDisconnected()` | No | |
| `hostUpdate()` | No | |
| `hostUpdated()` | No | |

### Directive
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | Yes ⚠️ | |
| `update()` | No | |
| `render()` | Yes ⚠️ | |
| `disconnected()` | No | Async directives only |
| `reconnected()` | No | Async directives only |

## Asynchronicity

There currently isn't a mechanism to wait for asynchronous results before continuing to render (such as results from async directives or controllers), though we are considering options to allow this in the future. The current workaround for this is to do any asynchronous work before rendering the top level template on the server and providing the data to the template as some attribute or property.

For example:
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

## Testing

The `@lit-labs/testing` package contains utility functions that utilize a [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) plugin to create test fixtures that are rendered server-side using `@lit-labs/ssr`. It can help test whether your components are server-side renderable. See more in the [readme](https://github.com/lit/lit/tree/main/packages/labs/testing#readme).
