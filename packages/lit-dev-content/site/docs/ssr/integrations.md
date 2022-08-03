---
title: Lit SSR integrations
eleventyNavigation:
  key: 🧪 Integrations
  parent: Server-side rendering
  order: 7
---

<details class="pre-release">
  <summary> 🧪 Pre-release software: not for production.</summary>
  
  Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

For more information about the Lit labs process, see [Lib Labs](/docs/libraries/labs/)

</details>

## Demos
- [SSR with global rendering](https://stackblitz.com/edit/lit-ssr-global?file=src/server.js)

TODO: Move below to new section
## Other considerations

### Modules with side effects

Some component modules might have either within them or somewhere in the module tree some side effects that rely on browser APIs making them incompatible with Lit SSR. Any browser API access must be limited to life cycle methods called on the client, or must have an alternative code path when running on the server. (Lit will provide an easy way of checking whether the code is running in an SSR environment in a future update. Follow the issue [[labs/ssr] A way for client code to check if running in server (isSsr)](https://github.com/lit/lit/issues/3158) for updates on this feature.)

### Asynchronicity

Current Lit SSR implementation will only render synchronous results and yield them immediately. The results can then be streamed out. There is no mechanism for asynchronous updates to change what was already streamed out.

For example:
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

There currently aren't any mechanisms to wait for some asynchronous result before continuing to render, though we are considering options. The current workaround for this is to do any asynchronous work before calling `render()` and providing the data to the template as some attribute or property.

