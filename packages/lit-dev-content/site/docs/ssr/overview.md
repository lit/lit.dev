---
title: Server-side rendering (SSR)
eleventyNavigation:
  key: Overview
  parent: Server rendering
  order: 1
---

<details class="pre-release">
  <summary> Pre-release software: not for production.</summary>
  
  Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

  For more information about the Lit labs process, see [Lib Labs](/docs/libraries/labs/)

</details>

Server-side rendering (SSR) can help make pages work without JavaScript, either for robustness or performance reasons, or to work with web crawlers and bots that don't run a full browser. Some sites can render faster if they render static markup first, and optionally hydrate the components afterwards by loading the JavaScript.

[Lit SSR](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) lets you render Lit components and templates to static HTML markup in non-browser JavaScript environments like Node. It works without fully emulating the browser's DOM, and takes advantage of Lit's declarative template format to support streaming.

Server-side rendering Lit elements also utilizes [Declarative Shadow Roots](https://web.dev/declarative-shadow-dom/) which is a new browser feature that is [shipping in Chrome](https://developer.chrome.com/blog/new-in-chrome-90/#declarative) which allows browsers to parse and attach shadow roots just by parsing HTML without the need for JavaScript. A polyfill is available for browsers without support yet whose usage is detailed in the [client API](/docs/ssr/client-api#lit-components) documentation.
