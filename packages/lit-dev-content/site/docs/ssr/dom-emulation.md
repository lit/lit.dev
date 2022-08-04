---
title: Lit SSR DOM emulation
eleventyNavigation:
  key: 🧪 DOM emulation
  parent: Server-side rendering
  order: 6
---

<details class="pre-release">
  <summary> 🧪 Pre-release software: not for production.</summary>
  
  Lit labs packages are published to get feedback from the wider community. This code shouldn't be used in production, but we encourage you to try it out and [file issues](https://github.com/lit/lit/issues/new/choose) for any bugs you find. For general feedback, please use the GitHub [discussion](https://github.com/lit/lit/discussions).

  For more information about the Lit labs process, see [Lib Labs](/docs/libraries/labs/)

</details>

Only the minimal DOM interfaces needed for `lit-html` and `LitElement` to boot are implemented, which are mostly base classes for extension, and a roughly functioning `CustomElementRegistry`.

Below lists all the properties, classes, and methods on the `window` object added to `globalThis`. The contents of `window` are also assigned onto `globalThis`. ✅ signifies item is implemented to be functionally the same as in the browser.

| Property | Notes |
|-|-|
| `Element` | ⚠️ Empty class |
| `HTMLElement` | ⚠️ Partial <table><tbody><tr><td>`attributes`</td><td>✅</td><tr><td>`shadowRoot`</td><td>✅</td><tr><td>`setAttribute()`</td><td>✅</td><tr><td>`removeAttribute()`</td><td>✅</td><tr><td>`hasAttribute()`</td><td>✅</td><tr><td>`attachShadow()`</td><td>✅</td><tr><td>`getAttribute()`</td><td>✅</td></tr></tbody></table> |
| `Document` | ⚠️ Partial <table><tbody><tr><td>`adoptedStyleSheets`</td><td>⚠️ Getter only returning `[]`</td><tr><td>`createTreeWalker()`</td><td>⚠️ Returns `{}`</td><tr><td>`createTextNode()`</td><td>⚠️ Returns `{}`</td><tr><td>`createElement()`</td><td>⚠️ Returns `{}`</td></tr></tbody></table> |
| `document` | Instance of `Document` |
| `cssStyleSheet` | ⚠️ Partial <table><tbody><tr><td>`replace()`</td><td>⚠️ No op</td></tr></tbody></table> |
| `ShadowRoot` | ⚠️ Empty class |
| `CustomElementRegistry` | <table><tbody><tr><td>`define()`</td><td>✅</td></tr><tr><td>`get()`</td><td>✅</td></tr></tbody></table> |
| `customElements` | Instance of `CustomElementRegistry` |
| `btoa()` | ✅ |
| `fetch()` | `node-fetch` |
| `location` | `new URL('http://localhost')` |
| `MutationObserver` | ⚠️ Partial <table><tbody><tr><td>`observe()`</td><td>⚠️ No op</td></tr></tbody></table> |
| `requestAnimationFrame()` | ⚠️ No op |
| `window` | ✅ Self reference |
