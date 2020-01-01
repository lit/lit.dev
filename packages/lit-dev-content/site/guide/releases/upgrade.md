---
title: Upgrade guide
eleventyNavigation:
  key: Upgrade guide
  parent: Releases
  order: 3
---

## Overview

Lit 2.0 is designed to work with most code written for LitElement 2.x and lit-html 1.x. There are a small number of changes required to migrate your code to Lit 2.0. The high-level changes required include:

1. Update npm packages and import paths.
1. Update to renamed APIs.
1. Update any custom directive implementations to use new class-based API and associated helpers
1. Load `platform-support` script when loading the webcomponents polyfills.
1. Note a number of minor breaking changes and adapt code as appropriate.

The following sections will go through each of these changes in detail.

## Update packages and import paths

### Use the `lit` package

Lit 2.0 ships with a one-stop-shop `lit` package, which consolidates `lit-html` and `lit-element` into an easy-to-use package. Use the following commands to upgrade:

```sh
npm uninstall lit-element lit-html
npm install lit
```

And re-write your module imports appropriately:

From:
```js
import {LitElement, html} from `lit-element`;
```
To:
```js
import {LitElement, html} from `lit`;
```

Although the `lit-element@^3` and `lit-html@^2` packages should be largely backward-compatible, we recommend updating to the `lit` package as this will be preferred and well-documented way to use Lit going forward.

### Update decorator imports

The previous version of `lit-element` exported all TypeScript decorators from the main module. In Lit 2.0, these have been moved to individual modules, to enable smaller bundle sizes when the decorators are unused.

From:
```js
import {property, customElement} from `lit-element`;
```
To:
```js
import {property} from `lit/decorators/property.js`;
import {customElement} from `lit/decorators/custom-element.js`;
```

### Update directive imports

Built-in lit-html directives are also now exported from the `lit` package.

From:
```js
import {repeat} from `lit-html/directives`;
```
To:
```js
import {repeat} from `lit/decorators/property.js`;
```


* Updating packages and import paths
  * lit-element@^3 -> lit@^2
  * lit-element decorators -> lit/decorators/... individual imports
  * lit-html directive -> lit/directive.js, lit/directive-helpers.js
  * updating-element -> @lit/reactive-element
* Update renamed APIs
  * UpdatingElement -> ReactiveElement
  * _getUpdateComplete() -> getUpdateComplete()
  * @internalProperty -> @state
  * static getStyles -> static finalizeStyles
  * NodePart -> ChildPart
* Update any custom directive implementations to use new class-based API
* Load `platform-support` script when loading the webcomponents polyfills.
* Note a number of minor breaking changes and adapt code as appropriate.
  * `lit-html`
    * `render()` no longer clears the container it's rendered to. It now appends to the container by default.
    * Expressions in comments are not rendered or updated.
    * Template caching happens per callsite, not per template-tag/callsize pair. This means some rare forms of highly dynamic template tags are no longer supported.
    * Arrays and other iterables passed to attribute bindings are not specially handled. Arrays will be rendered with their default toString representation. This means that `` html`<div class=${['a', 'b']}> `` will render `<div class="a,b">` instead of `<div class="a b">`. To get the old behavior, use `array.join(' ')`.
    * The `templateFactory` option of `RenderOptions` has been removed.
    * `TemplateProcessor` has been removed.
    * Symbols are not converted to a string before mutating DOM, so passing a Symbol to an attribute or text binding will result in an exception.
  * `LitElement`
    * `update` and `render` callbacks will only be called when the element is
  connected to the document. If an element is disconnected while an update is
  pending, or if an update is requested while the element is disconnected,
  update callbacks will be called if/when the element is re-connected.
    * Errors that occur during the update cycle were previously squelched to allow subsequent updates to proceed normally. Now errors are re-fired asynchronously so they can be detected. Errors can be observed via an `unhandledrejection` event handler on window.
    * Rendering of `renderRoot`/`shadowRoot`) via `createRenderRoot` and support for `static styles` has moved from `LitElement` to `UpdatingElement`.
    * The `createRenderRoot` method is now called just before the first update rather than in the constructor. Element code can not assume the `renderRoot` exists before the element `hasUpdated`. This change was made for compatibility with SSR.
    * `UpdatingElement`'s `initialize` method has been removed. This work is now done in the element constructor.
    * The static `render` has been removed.
    * When a property declaration is `reflect: true` and its `toAttribute` function returns `undefined` the attribute is now removed where previously it was left unchanged ([#872](https://github.com/Polymer/lit-element/issues/872)).
    * The dirty check in `attributeChangedCallback` has been removed. While technically breaking, in practice it should very rarely be ([#699](https://github.com/Polymer/lit-element/issues/699)).
    * LitElement's `adoptStyles` method has been removed. Styling is now adopted in `createRenderRoot`. This method may be overridden to customize this behavior.
    * For simplicity, `requestUpdate` no longer returns a Promise. Instead await the `updateComplete` Promise.
    * Removed `requestUpdateInternal`. The `requestUpdate` method is now identical to this method and should be used instead.
    * The type of the `css` function has been changed to `CSSResultGroup` and is now the same as `LitElement.styles`. This avoids the need to cast the `styles` property to `any` when a subclass sets `styles` to an Array and its super class set a single value (or visa versa).
