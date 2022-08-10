---
title: Server-side rendering (SSR)
eleventyNavigation:
  key: Overview
  parent: Server rendering
  order: 1
---

{% aside "labs" "no-header" %}

  SSR support is in <b>Lit Labs</b>, so it's in active early development and may have bugs/missing features. If you find a bug, file an [issue](https://github.com/lit/lit/issues/new/choose). For questions/comments, start a [discussion](https://github.com/lit/lit/discussions)

{% endaside %}

Server-side rendering (SSR) can help make pages work without JavaScript, either for robustness or performance reasons, or to work with web crawlers and bots that don't run a full browser. Some sites can render faster if they render static markup first, and optionally hydrate the components afterwards by loading the JavaScript.

[Lit SSR](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) lets you render Lit components and templates to static HTML markup in non-browser JavaScript environments like Node. It works without fully emulating the browser's DOM, and takes advantage of Lit's declarative template format to support streaming.

Server-side rendering Lit elements also utilizes [Declarative Shadow Roots](https://web.dev/declarative-shadow-dom/) which is a new browser feature that is [shipping in Chrome](https://developer.chrome.com/blog/new-in-chrome-90/#declarative) which allows browsers to parse and attach shadow roots just by parsing HTML without the need for JavaScript. A polyfill is available for browsers without support yet whose usage is detailed in the [client API](/docs/ssr/client-api#lit-components) documentation.
