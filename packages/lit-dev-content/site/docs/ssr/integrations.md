---
title: Lit SSR integrations
eleventyNavigation:
  key: 🧪 Integrations
  parent: Server-side rendering
  order: 7
---
## Other considerations

### Modules with side effects

Some component modules might have either within them or somewhere in the module tree some side effects that rely on browser APIs.

### Asynchronicity

Current Lit SSR implementation will only render synchronous results and yield them immediately, which can then be streamed out without an opportunity for asynchronous updates to change what was already streamed out.

For example
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

There currently aren't any mechanisms to wait for some asynchronous result before continuing to render yet, though we are considering options. Current work around for this is to do any asynchronous work before calling `render()` and providing it to the template as some attribute or property.

## Demos
- [SSR with global rendering](https://stackblitz.com/edit/lit-ssr-global?file=src/server.js)
