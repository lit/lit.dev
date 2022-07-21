---
title: Servber-side rendering lifecycle
eleventyNavigation:
  key: Lifecycle
  parent: Server-side rendering
  order: 4
---

The table below lists the standard custom element and Lit element lifecycle methods and whether they are called during SSR and during hydration.

Be mindful that methods called on the server should not contain references to browser/DOM APIs that have not been shimmed. Methods that are not called server-side may contain those references without throwing.

### LitElement
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `copnnectedCallback()` | ❌ | ✅ | Currently not called on SSR but may be subject to change. |
| `disconnectedCallback()` | ❌ | ❌ | |
| `attributeChangedCallback()` | ❌ | ✅ | No reactivity in SSR |
| `adoptedCallback()` | ❌ | ❌ | |
| `hasChanged()` | ✅ | ✅ | Called when property is set for initial SSR. |
| `shouldUpdate()` | ❌ | ✅ | |
| `willUpdate()` | ✅ | ✅ | Called before `render()` in SSR. |
| `update()` | ❌ | ✅ | |
| `render()` | ✅ | ✅ | |
| `firstUpdate()` | ❌ | ✅ | |
| `updated()` | ❌ | ✅ | |

### ReactiveController
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `hostConnected()` | ❌ | ✅ | |
| `hostDisconnected()` | ❌ | ❌ | |
| `hostUpdate()` | ❌ | ✅ | No reactivity in SSR |
| `hostUpdated()` | ❌ | ✅ | No reactivity in SSR |

### Directive
| Method | Called on server | Called on hydration | Notes |
|-|-|-|-|
| `constructor()` | ✅ | ✅ | |
| `update()` | ❌ | ✅ | |
| `render()` | ✅ | ⚠️ | On hydration, `render()` won't be explicitly called but the default `update()` method, if not overridden, will call and return the result of `render()` |
| `disconnected()` | ❌ | ❌ | Async directives only |
| `reconnected()` | ❌ | ❌ | Async directives only |
