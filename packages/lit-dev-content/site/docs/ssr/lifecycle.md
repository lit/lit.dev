---
title: Lit SSR lifecycle
eleventyNavigation:
  key: Lifecycle
  parent: Server rendering
  order: 5
---

{% labs-disclaimer %}

The tables below lists the standard custom element and Lit element lifecycle methods and whether they are called during SSR and during hydration.

Be mindful that methods called on the server should not contain references to browser/DOM APIs that have not been shimmed. Methods that are not called server-side may contain those references without throwing.

<!-- TODO(augustinekim) Replace emojis below with icons https://github.com/lit/lit.dev/pull/880#discussion_r944821511 -->
## LitElement
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `connectedCallback()` | ❌ | Currently not called on SSR but may be subject to change |
| `disconnectedCallback()` | ❌ | |
| `attributeChangedCallback()` | ❌ | |
| `adoptedCallback()` | ❌ | |
| `hasChanged()` | ✅ | Called when property is set |
| `shouldUpdate()` | ❌ | |
| `willUpdate()` | ✅ | Called before `render()` |
| `update()` | ❌ | |
| `render()` | ✅ | |
| `firstUpdate()` | ❌ | |
| `updated()` | ❌ | |

## ReactiveController
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `hostConnected()` | ❌ | |
| `hostDisconnected()` | ❌ | |
| `hostUpdate()` | ❌ | |
| `hostUpdated()` | ❌ | |

## Directive
| Method | Called on server | Notes |
|-|-|-|
| `constructor()` | ✅ | |
| `update()` | ❌ | |
| `render()` | ✅ | |
| `disconnected()` | ❌ | Async directives only |
| `reconnected()` | ❌ | Async directives only |
