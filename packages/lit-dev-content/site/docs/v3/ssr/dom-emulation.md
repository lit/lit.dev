---
title: Lit SSR DOM emulation
eleventyNavigation:
  key: DOM emulation
  parent: Server rendering
  order: 5
versionLinks:
  v2: ssr/dom-emulation/
---

{% labs-disclaimer %}

When running in Node, Lit automatically imports and uses a set of DOM shims, and defines the `customElements` global. Only the minimal DOM interfaces needed to define and register components are implemented. These include a few key DOM classes and a roughly functioning `CustomElementRegistry`.

✅ signifies item is implemented to be functionally the same as in the browser.

<!-- TODO(augustinekim) Consider replacing emojis below with icons https://github.com/lit/lit.dev/pull/880#discussion_r944821511 -->
| Property | Notes |
|-|-|
| `Element` | ⚠️ Partial <table><tbody><tr><td>`attributes`</td><td>✅</td><tr><td>`shadowRoot`</td><td>⚠️ Returns `{host: this}` if `attachShadow()` was called with `{mode: 'open'}`</td><tr><td>`setAttribute()`</td><td>✅</td><tr><td>`removeAttribute()`</td><td>✅</td><tr><td>`hasAttribute()`</td><td>✅</td><tr><td>`attachShadow()`</td><td>⚠️ Returns `{host: this}`</td><tr><td>`getAttribute()`</td><td>✅</td></tr></tbody></table> |
| `HTMLElement` | ⚠️ Empty class |
| `CustomElementRegistry` | <table><tbody><tr><td>`define()`</td><td>✅</td></tr><tr><td>`get()`</td><td>✅</td></tr></tbody></table> |
| `customElements` | Instance of `CustomElementRegistry` |
