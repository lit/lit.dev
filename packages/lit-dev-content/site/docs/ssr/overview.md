---
title: Lit SSR overview
eleventyNavigation:
  key: 🧪 Overview
  parent: Server-side rendering
  order: 1
---

{% aside "info" %}

Pre-release software.

Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

For more information about the Lit labs process, see [Lib Labs](/libraries/labs/).

{% endaside %}

[Lit SSR](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) lets you render Lit components and templates to static HTML markup in non-browser JavaScript environments like Node.

SSR can help make pages work without JavaScript, either for robustness or performance reasons, or to work with web crawlers and bots that don't run a full browser. Some sites can render faster if they render static markup first, then load client-side later, and optionally hydrate components.

Lit SSR works without fully emulating the browser's DOM, and takes advantage of Lit's declarative template format to support streaming.

Rendering web components in a server environment incurs some restrictions on component code because most browser DOM APIs are not available, and some concepts like certain lifecycle callbacks don't apply to a server, and streaming rendering occurs in a strict top-down ordering. Server-side rendering Lit elements also utilizes [Declarative Shadow Roots](https://web.dev/declarative-shadow-dom/) which is a new browser feature that is shipping in [Chrome](https://developer.chrome.com/blog/new-in-chrome-90/#declarative) but will require JavaScript polyfill for other browsers.
