---
title: Authoring components for Lit SSR
eleventyNavigation:
  key: Authoring components
  parent: Server rendering
  order: 4
---

{% labs-disclaimer %}

Lit's approach to rendering web components in a server environment places some restrictions on component code to achieve efficient server rendering. When authoring components, keep in mind these considerations to ensure they are compatible with Lit SSR.

Note: The restrictions listed on this page are subject to change as we make improvements to Lit SSR. If you would like to see a certain use case supported, please [file an issue](https://github.com/lit/lit/issues/new/choose) or start a [discussion](https://github.com/lit/lit/discussions) thread.

## Considerations

### Browser only code

Most browser DOM APIs are not available in the Node environment. Lit SSR utilizes a DOM shim that's the bare minimum required for rendering Lit templates and components. For a full list of what APIs are available, see the [DOM Emulation](/docs/ssr/dom-emulation) page.

When authoring components, perform imperative DOM operations from lifecycle methods that are called only on the client, and not on the server. See the [lifecycles](#lifecycles) section below for what specific methods can be used.

Some component modules may also have side effects that utilize browser APIs, for example to detect certain browser features, which would break simply by importing in a non-browser environment. If these side-effects cannot be moved to a client-only lifecycle, you must provide proper alternatives or some default behavior for when running in Node.

For simple cases, adding conditionals or optional chaining to certain DOM accesses may be sufficient to guard against unavailable DOM APIs. For example:

```js
const hasConstructableStylesheets = typeof globalThis.CSSStyleSheet?.prototype.replaceSync === 'function';
```

The Lit team is also working on providing an easy way of checking whether the code is running in a Node environment which can be utilized to write conditional code blocks targeting different environments. Follow the issue [[labs/ssr] A way for client code to check if running in server (isSsr)](https://github.com/lit/lit/issues/3158) for updates on this feature.

For more complex uses cases, consider utilizing [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) in Node that specifically match for `"node"` environments so you could have different code depending on whether the module is being imported for use in Node or in the browser. Users would get the appropriate version of the package depending on whether it was imported from Node or the browser. Export conditions are also supported by popular bundling tools like [rollup](https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions) and [webpack](https://webpack.js.org/configuration/resolve/#resolveconditionnames) so users can bring in the appropriate code for your bundle.

Note: Due to the way Lit libraries utilize conditional export for providing code meant for import in Node, we strongly discourage bundling `lit` into your component for packages being published to NPM as your bundle will only include a particular version of `lit` meant for a particular environment.

### Lifecycle

Only a select number of web component, `LitElement`, and Lit directive lifecycle callbacks will be run during server-side rendering that are utilized to generate the initial styling and markup for the component. Additional lifecycle methods will be called client-side during hydration and subsequent changes to the page.

The tables below lists the standard custom element and Lit element lifecycle methods and whether they are called during SSR and during hydration.

Be mindful that methods called on the server should not contain references to browser/DOM APIs that have not been shimmed. Methods that are not called server-side may contain those references without causing breakages.

<!-- TODO(augustinekim) Replace emojis below with icons https://github.com/lit/lit.dev/pull/880#discussion_r944821511 -->
#### Standard custom element and LitElement
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `connectedCallback()` | ❌ | Currently not called on SSR but may be subject to change |
| `disconnectedCallback()` | ❌ | |
| `attributeChangedCallback()` | ❌ | |
| `adoptedCallback()` | ❌ | |
| `hasChanged()` | ✅ | Called when property is set |
| `shouldUpdate()` | ❌ | |
| `willUpdate()` | ✅ | Called before `render()` |
| `update()` | ❌ | |
| `render()` | ✅ | |
| `firstUpdate()` | ❌ | |
| `updated()` | ❌ | |

#### ReactiveController
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `hostConnected()` | ❌ | |
| `hostDisconnected()` | ❌ | |
| `hostUpdate()` | ❌ | |
| `hostUpdated()` | ❌ | |

#### Directive
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `update()` | ❌ | |
| `render()` | ✅ | |
| `disconnected()` | ❌ | Async directives only |
| `reconnected()` | ❌ | Async directives only |


### Asynchronicity

There currently isn't a mechanism to wait for asynchronous results before continuing to render (such as results from async directives or controllers), though we are considering options to allow this in the future. The current workaround for this is to do any asynchronous work before rendering the top level template on the server and providing the data to the template as some attribute or property.

For example:
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

## Testing

The `@lit-labs/testing` package contains utility functions that utilize a [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) plugin to create test fixtures that are rendered server-side using `@lit-labs/ssr`. It can help test whether your components are server-side renderable. See more in the [readme](https://github.com/lit/lit/tree/main/packages/labs/testing#readme).