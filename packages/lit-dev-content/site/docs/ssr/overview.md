---
title: Server-side rendering (SSR)
eleventyNavigation:
  key: Overview
  parent: Server rendering
  order: 1
---

{% labs-disclaimer %}

Server-side rendering (SSR) is a technique for generating and serving the HTML of your components, including shadow DOM and styles, before their JavaScript implementations have loaded and executed.

You can use SSR for a variety of reasons:
- Performance. Some sites can render faster if they render static HTML first without waiting for JavaScript to load, then (optionally) load the page's JavaScript and hydrate the components.
- SEO and web crawlers. While the major search-engine web crawlers render pages with full JavaScript-enabled browsers, not all web crawlers support JavaScript.
- Robustness. Static HTML renders even if the JavaScript fails to load or the user has JavaScript disabled.

For a deeper dive into server-side rendering concepts and techniques generally, see [Rendering on the Web](https://web.dev/rendering-on-the-web/) on web.dev.

Lit supports server-side rendering through the [Lit SSR](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) package. Lit SSR renders Lit components and templates to static HTML markup in non-browser JavaScript environments like Node. It works without fully emulating the browser's DOM, and takes advantage of Lit's declarative template format to enable fast performance, low time-to-first-byte, and support streaming.

Server-side rendering Lit components utilizes [Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/), a new HTML feature that is [shipping in Chrome and Edge](https://developer.chrome.com/blog/new-in-chrome-90/#declarative) which allows HTML to attach shadow roots to elements without the need for JavaScript.

Until all browsers include declarative shadow DOM support, a very small polyfill is available that can be inlined into your page. This lets you use SSR now for any browsers and crawlers with JavaScript enabled and incrementally address non-JavaScript use cases as the feature is rolled out to the rest of the browsers and crawlers. Usage of the polyfill is detailed in the [client API](/docs/ssr/client-api#lit-components) documentation.

Lit SSR is a low-level library that you can use directly in your Node-based server or site generator. A number of [integrations](/docs/ssr/integrations) have also been published which make Lit SSR work out-of-the-box for frameworks like Eleventy, Astro, and Rocket.
