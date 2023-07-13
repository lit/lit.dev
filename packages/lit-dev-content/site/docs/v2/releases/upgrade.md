---
title: Upgrade guide
eleventyNavigation:
  key: Upgrade guide
  parent: Releases
  order: 3
versionLinks:
  v3: releases/upgrade/
---

## Overview

Lit 2.0 is designed to work with most code written for LitElement 2.x and lit-html 1.x. There are a small number of changes required to migrate your code to Lit 2.0. The high-level changes required include:

1. Updating npm packages and import paths.
1. Loading `polyfill-support` script when loading the web components polyfills.
1. Updating any custom directive implementations to use new class-based API and associated helpers.
1. Updating code to renamed APIs.
1. Adapting to minor breaking changes, mostly in uncommon cases.

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
import {LitElement, html} from 'lit-element';
```
To:
```js
import {LitElement, html} from 'lit';
```

Although the `lit-element@^3` and `lit-html@^2` packages should be largely backward-compatible, we recommend updating to the `lit` package as the other packages are moving towards eventual deprecation.

### Update decorator imports

The previous version of `lit-element` exported all TypeScript decorators from the main module. In Lit 2.0, these have been moved to a separate module, to enable smaller bundle sizes when the decorators are unused.

From:
```js
import {property, customElement} from 'lit-element';
```
To:
```js
import {property, customElement} from 'lit/decorators.js';
```

### Update directive imports

Built-in lit-html directives are also now exported from the `lit` package.

From:
```js
import {repeat} from 'lit-html/directives/repeat.js';
```
To:
```js
import {repeat} from 'lit/directives/repeat.js';
```

### Update standalone lit-html imports

If using lit-html standalone (outside of LitElement), you can import standalone-specific API's like `render` from the `lit/html.js` entrypoint:

From:
```js
import {render, html} from 'lit-html';
```
To:
```js
import {render, html} from 'lit/html.js';
```

## Load `polyfill-support` when using web components polyfills

Lit 2.0 still supports the same browsers down to IE11. However, given the broad adoption of Web Components APIs in modern browsers, we have taken the opportunity to move all of the code required for interfacing with the web components polyfills out of the core libraries and into an opt-in support file, so that the tax for supporting older browsers is only paid when required.

In general, any time you use the web components polyfills, you should also load the `lit/polyfill-support.js` support file once on the page, similar to a polyfill. For example:

```html
<script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js">
<script src="node_modules/lit/polyfill-support.js">
```

If using [`@web/test-runner`](https://modern-web.dev/docs/test-runner/overview/) or [`@web/dev-server`](https://modern-web.dev/docs/dev-server/overview/) with the [`legacyPlugin`](https://modern-web.dev/docs/dev-server/plugins/legacy/) for development, adding the following configuration to your `web-test-runner.config.js` or `web-dev-server.config.js` file will configure it to automatically inject the support file when needed:

```js
export default {
  ...
  plugins: [
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
  ],
};

```

## Update to renamed APIs

The following advanced API's have been renamed in Lit 2.0. It should be safe to simply rename these across your codebase if used:

| Previous name | New name | Notes |
| ------------- | -------- | ----- |
| `UpdatingElement` | `ReactiveElement` | The base class underpinning `LitElement`. Naming now aligns with terminology we use to describe its reactive lifecycle. |
| `@internalProperty` | `@state` | Decorator for `LitElement` / `ReactiveElement` used to denote private state that trigger updates, as opposed to public properties on the element settable by the user which use the `@property` decorator. |
| `static getStyles()` | `static finalizeStyles(styles)` | Method on `LitElement` and `ReactiveElement` class used for overriding style processing. Note it now also takes an argument reflecting the static styles for the class. |
| `_getUpdateComplete()` | `getUpdateComplete()` | Method on `LitElement` and `ReactiveElement` class used for overriding the `updateComplete` promise |
| `NodePart` | `ChildPart` | Typically only used in directive code; see below.

## Update custom directive implementations
While the API for _using_ directives should be 100% backward-compatible with
1.x, there is a breaking change to how custom directives are _authored_. The API
change improves ergonomics around making stateful directives while providing a
clear pattern for SSR-compatible directives: only `render` will be called on the
server, while `update` will not be.


### Overview of directive API changes

| Concept | Previous API | New API |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Code&nbsp;idiom** | Function that takes directive arguments, and returns function that takes `part` and returns value | Class that extends `Directive` with `update` & `render` methods which accept directive arguments |
| **Declarative&nbsp;rendering** | Pass value to `part.setValue()` | Return value from `render()` method |
| **DOM&nbsp;manipulation** | Implement in directive function | Implement in `update()` method |
| **State** | Stored in `WeakMap` keyed on `part` | Stored in class instance fields |
| **Part&nbsp;validation** | `instanceof` check on `part` in every render | `part.type` check in constructor |
| **Async&nbsp;updates** | `part.setValue(v);`<br>`part.commit();` | Extend `AsyncDirective` instead of `Directive` and call `this.setValue(v)` |

### Example directive migration

Below is an example of a lit-html 1.x directive, and how to migrate it to the
new API:

1.x Directive API:

```js
import {html, directive, Part, NodePart} from 'lit-html';

// State stored in WeakMap
const previousState: WeakMap<Part, number> = new WeakMap();

// Functional-based directive API
export const renderCounter = directive((initialValue: number) => (part: Part) => {
  // When necessary, validate part type each render using `instanceof`
  if (!(part instanceof NodePart)) {
    throw new Error('renderCounter only supports NodePart');
  }
  // Retrieve value from previous state
  let value = previousState.get(part);
  // Update state
  if (value === undefined) {
    value = initialValue;
  } else {
    value++;
  }
  // Store state
  previousState.set(part, value);
  // Update part with new rendering
  part.setValue(html`<p>${value}</p>`);
});
```

2.0 Directive API:

```js
import {html} from 'lit';
import {directive, Directive, Part, PartInfo, PartType} from 'lit/directive.js';

// Class-based directive API
export class RenderCounter extends Directive {
  // State stored in class field
  value: number | undefined;
  constructor(partInfo: PartInfo) {
    super(partInfo);
    // When necessary, validate part in constructor using `part.type`
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('renderCounter only supports child expressions');
    }
  }
  // Optional: override update to perform any direct DOM manipulation
  update(part: Part, [initialValue]: DirectiveParameters<this>) {
    /* Any imperative updates to DOM/parts would go here */
    return this.render(initialValue);
  }
  // Do SSR-compatible rendering (arguments are passed from call site)
  render(initialValue: number) {
    // Previous state available on class field
    if (this.value === undefined) {
      this.value = initialValue;
    } else {
      this.value++;
    }
    return html`<p>${this.value}</p>`;
  }
}
export const renderCounter = directive(RenderCounter);
```

## Adapt to minor breaking changes

For completeness, the following is a list of minor but notable breaking changes
that you may need to adapt your code to. We expect these changes to affect
relatively few users.

### `LitElement`
* For simplicity, `requestUpdate` no longer returns a Promise. Instead await the `updateComplete` Promise.
* Errors that occur during the update cycle were previously squelched to allow subsequent updates to proceed normally. Now errors are re-fired asynchronously so they can be detected. Errors can be observed via an `unhandledrejection` event handler on window.
* Creation of `shadowRoot` via `createRenderRoot` and support for applying `static styles` to the `shadowRoot` has moved from `LitElement` to `ReactiveElement`.
* The `createRenderRoot` method is now called just before the first update rather than in the constructor. Element code can not assume the `renderRoot` exists before the element `hasUpdated`. This change was made for compatibility with server-side rendering.
* `ReactiveElement`'s `initialize` method has been removed. This work is now done in the element constructor.
* The _static_ `render` method on the `LitElement` base class has been removed. This was primarily used for implementing ShadyDOM integration, and was not intended as a user-overridable method. ShadyDOM integration is now achieved via the `polyfill-support` module.
* When a property declaration is `reflect: true` and its `toAttribute` function returns `undefined` the attribute is now removed where previously it was left unchanged ([#872](https://github.com/Polymer/lit-element/issues/872)).
* The dirty check in `attributeChangedCallback` has been removed. While technically breaking, in practice it should very rarely be ([#699](https://github.com/Polymer/lit-element/issues/699)).
* LitElement's `adoptStyles` method has been removed. Styling is now adopted in `createRenderRoot`. This method may be overridden to customize this behavior.
* Removed `requestUpdateInternal`. The `requestUpdate` method is now identical to this method and should be used instead.

### `lit-html`
* `render()` no longer clears the container it's rendered to on first render. It now appends to the container by default.
* Expressions in comments are not rendered or updated.
* Template caching happens per call site, not per template-tag/call-site pair. This means some rare forms of highly dynamic template tags are no longer supported.
* Arrays and other iterables passed to attribute bindings are not specially handled. Arrays will be rendered with their default toString representation. This means that `` html`<div class=${['a', 'b']}> `` will render `<div class="a,b">` instead of `<div class="a b">`. To get the old behavior, use `array.join(' ')`.
* The `templateFactory` option of `RenderOptions` has been removed.
* `TemplateProcessor` has been removed.
* Symbols are not converted to a string before mutating DOM, so passing a Symbol to an attribute or text binding will result in an exception.
* The `ifDefined` directive in an attribute expression now removes the attribute for both `null` and `undefined`, not just `undefined`.
* Rendering the value `nothing` to an attribute expression causes the attribute to be removed—even if there are multiple expressions in the attribute value position and only one is `nothing`. For example given `src="${baseurl}/${filename}"`, the `src` attribute is removed if _either_ `baseurl` or `filename` evaluate to `nothing`.
* Rendering the value `nothing`, `null`, or `undefined` in the `unsafeHTML` or `unsafeSVG` directive will now result in no content being rendered (previously it would render `'[object Object]'`, `'null'`, or `'undefined'`, respectively).
