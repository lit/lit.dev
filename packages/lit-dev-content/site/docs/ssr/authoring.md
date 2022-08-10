---
title: Authoring components for Lit SSR
eleventyNavigation:
  key: Authoring components
  parent: Server rendering
  order: 4
---

<details class="pre-release">
  <summary> Pre-release software: not for production.</summary>
  
  Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

  For more information about the Lit labs process, see [Lib Labs](/docs/libraries/labs/)

</details>

Rendering web components in a server environment incurs some restrictions on component code. When authoring components, keep in mind these considerations if you your components to be compatible with Lit SSR.

Note: The restrictions listed on this page are subject to change as we make improvements to Lit SSR. If you would like to see a certain use case supported, please [file an issue](https://github.com/lit/lit/issues/new/choose) or start a [discussion](https://github.com/lit/lit/discussions) thread.

## Considerations

### Browser only code

Most browser DOM APIs are not available in the Node environment. Lit SSR utilizes a DOM shim that's the bare minimum required for rendering Lit templates and components. For a full list of what APIs are available, see the [DOM Emulation](/docs/ssr/dom-emulation) page.

Be mindful that browser only code is encapsulated into lifecycle methods that are called only on the client, and not on the server. See the [lifecycles](#lifecycles) section below for what specific methods can be used.

Some component modules may also have side effects that utilize browser APIs, to detect for certain browser features for example, which would break simply by importing in a non-browser environment. These side effects, if they cannot be moved to a client-only lifecycle, must have proper alternatives or some default behavior for when running in Node.

One way of achieving this would be to utilize [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) in Node that specifically match for `"node"` environments so you could have different code depending on whether the module is being imported for use in Node or in the browser. Users would get the appropriate version of the package depending on whether it was imported from Node or the browser. Export conditions are also supported by popular bundling tools like [rollup](https://github.com/rollup/plugins/tree/master/packages/node-resolve#exportconditions) and [webpack](https://webpack.js.org/configuration/resolve/#resolveconditionnames) so users can bring in the appropriate code for your bundle.

The Lit team is also working on providing an easy way of checking whether the code is running in a Node environment which can be utilized to write conditional code blocks targeting different environments. Follow the issue [[labs/ssr] A way for client code to check if running in server (isSsr)](https://github.com/lit/lit/issues/3158) for updates on this feature.

Note: Due to the way Lit libraries utilize conditional export for providing code meant for import in Node, we strongly discourage bundling `lit` into your component for packages being published to NPM as your bundle will only include a particular version of `lit` meant for a particular environment.

### Lifecycle

Only a select number of web component and Lit element lifecycle callbacks will be run during server-side rendering that are utilized to generate the initial styling and markup for the component. Additional lifecycle methods will be called during hydration and subsequent events.

See the [lifecycle](/docs/ssr/lifecycle) page for a detailed list of lifecycle methods that are called during SSR and hydration.

### Asynchronicity

Current Lit SSR implementation will only render synchronous results and yield them immediately. The results are streamed out as they become available. There is no mechanism for asynchronous updates to change what was already streamed out.

For example:
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

There currently aren't any mechanisms to wait for some asynchronous result before continuing to render, though we are considering options to allow this in the future. The current workaround for this is to do any asynchronous work before calling `render()` and providing the data to the template as some attribute or property.

## Testing

The `@lit-labs/testing` package contains utility functions that utilize a [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) plugin to create test fixtures that are rendered server-side using `@lit-labs/ssr`. It can help test whether your components are server-side renderable. See more in the [readme](https://github.com/lit/lit/tree/main/packages/labs/testing#readme).
