---
title: Server-side rendering overview
eleventyNavigation:
  key: Overview
  parent: Server-side rendering
  order: 1
---

{% aside "info" %}

Pre-release software.

Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

For more information about the Lit labs process, see [Lib Labs](/libraries/labs/).

{% endaside %}

[Lit SSR](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) lets you render Lit components and templates to static HTML markup in non-browser JavaScript environments like Node.

Lit SSR works without emulating the browser's DOM, and takes advantage of Lit's declarative template format to support streaming.

SSR can help make pages work without JavaScript, either for robustness or performance reasons, or to work with web crawlers and bots that don't run a full browser. Some sites can render faster if they render static markup first, then load client-side later, and optionally hydrate components.

Rendering web components in a server environment incurs some restrictions on component code because most browser DOM APIs are not available, and some concepts like certain lifecycle callbacks don't apply to a server, and streaming rendering occurs in a strict top-down ordering.

## Other considerations

### Modules with side effects

Some component modules might have either within them or somewhere in the module tree some side effects that rely on browser APIs, for instance, to check for presence of browser features or pre-instantiating a `DOMParser`. These will cause errors during server rendering.

### Asynchronicity

Current Lit SSR implementation will only render synchronous results and yield them immediately, which can then be streamed out without an opportunity for asynchronous updates to change what was already streamed out.

For example
 - Async directives such as `asyncAppend()` or `asyncReplace()` will not produce any renderable results server-side.
 - `until()` directive will only ever result in the highest-priority non-promise placeholder value.

There currently aren't any mechanisms to wait for some asynchronous result before continuing to render yet, though we are considering options. Current work around for this is to do any asynchronous work before calling `render()` and providing it to the template as some attribute or property.