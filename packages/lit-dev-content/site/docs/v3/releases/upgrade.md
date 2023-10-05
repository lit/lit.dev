---
title: Lit 3 upgrade guide
eleventyNavigation:
  key: Lit 3 upgrade guide
  parent: Releases
  order: 3
versionLinks:
  v2: releases/upgrade/
---

<div class="alert alert-info">

If you are looking to migrate from Lit 1.x to Lit 2.x, see the [Lit 2 upgrade guide](/docs/v2/releases/upgrade/).

</div>

## Overview

Lit 3.0 has very few breaking changes from Lit 2.x:

- IE11 is no longer supported.
- Lit's npm modules are now published as ES2021.
- APIs marked deprecated in Lit 2.x releases have been removed.
- SSR hydration support modules have moved to the `@lit-labs/ssr-client` package.
- Decorator behavior has been unified between TypeScript experimental decorators and standard decorators.
- Support was removed for Babel decorators version "2018-09"

Lit 3.0 should require no changes to upgrade from Lit 2.x for the vast majority
of users. Most apps and libraries should be able to extend their npm version
ranges to include both 2.x and 3.x, like `"^2.7.0 || ^3.0.0"`.

Lit 2.x and 3.0 are _interoperable_: templates, base classes, and directives from one version of Lit will work with those from another.

## Updates to Lit decorators

The Lit 3 decorators are largely backwards compatible. If you've been using them with TypeScript, **most likely no changes are needed**. We've added forward compatibility with standard decorators, but the legacy `experimentalDecorators: true` without the `accessor` keyword is currently the more performant option.

In Lit 3.0 there are three supported ways to use our decorators:

1. With the TypeScript `experimentalDecorators` flag and properties without the `accessor` keyword. This is backwards compatible with Lit 2.
2. With the TypeScript `experimentalDecorators` flag and using the `accessor` keyword. This aids migration to standard decorators. [Code can add the `accessor` keyword one decorator at a time to migrate gradually](#standard-decorator-migration).
3. As standard decorators, which need the `accessor` keyword, and TypeScript 5.2 (without the `experimentalDecorators` flag), or Babel 7.23.0.

Each supported way of using decorators is self contained. An application can mix and match libraries written in each of these configurations, and it is not generally a breaking change for a library to switch from one decorator configuration to another.

To make Lit decorators consistent between both decorator modes there have been some minor breaking
changes to Lit decorator behavior:

- `@property()` and `@state()` must be used on the setter for hand-written accessors. [Decorating the getter no longer works](#decorated-getter).
- `requestUpdate()` is called automatically for `@property()` and `@state()` decorated
  accessors where previously that was the setters responsibility.
- The value of an accessor is read on first render and used as the initial value for `changedProperties` and attribute reflection.

To use the standard decorator configuration, your decorated class fields **must** include the `accessor` keyword.
To aid in migration from experimental decorators to standard decorators, decorated class fields with the `accessor` keyword will also work with the `experimentalDecorators` flag set to `true`. So users can start migrating code without changing the TS configuration.

## List of removed APIs

If your Lit 2.x project does not have deprecation warnings you should not be
impacted by this list.

- [Removed `UpdatingElement` alias for `ReactiveElement`.](#removed-updating-element)
- [Removed re-export of decorators from main `lit-element` module.](#removed-re-export-decorators)
- [Removed deprecated call signature for the `queryAssignedNodes` decorator.](#removed-queryassignednodes-non-object)
- [Moved experimental server side rendering hydration modules from `lit`, `lit-element`, and `lit-html` to `@lit-labs/ssr-client`.](#moved-experimental-hydration)

## Steps to Upgrade

### Removed `UpdatingElement` alias for `ReactiveElement` {#removed-updating-element}

Replace Lit 2.x usage of `UpdatingElement` with `ReactiveElement`. This is not a
functional change as `UpdatingElement` was aliasing `ReactiveElement`.

```ts
// Removed
import {UpdatingElement} from 'lit';

// Updated
import {ReactiveElement} from 'lit';
```

### Removed re-export of decorators from `lit-element` {#removed-re-export-decorators}

Lit 3.0 [built-in
decorators](/docs/v3/components/decorators/#built-in-decorators) are no longer
exported by `lit-element`, and should instead be imported from
`lit/decorators.js`.

```ts
// Removed decorator exports from lit-element
import {customElement, property, state} from 'lit-element';

// Updated
import {customElement, property, state} from 'lit/decorators.js';
```

### Deprecated `queryAssignedNodes(slot: string, flatten: bool, selector: string)` decorator removed {#removed-queryassignednodes-non-object}

Migrate any usage of `queryAssignedNodes` taking a selector to use `queryAssignedElements`.

```ts
// Removed
@queryAssignedNodes('list', true, '.item')

// Updated
@queryAssignedElements({slot: 'list', flatten: true, selector: '.item'})
```

Usages without a `selector` now must take an options object.

```ts
// Removed
@queryAssignedNodes('list', true)

// Updated
@queryAssignedNodes({slot: 'list', flatten: true})
```

### Server side rendering experimental hydration modules removed from `lit`, `lit-element`, and `lit-html` {#moved-experimental-hydration}

Experimental hydration support has been moved out of core libraries and into
[`@lit-labs/ssr-client`](https://www.npmjs.com/package/@lit-labs/ssr-client).

```ts
// Removed
import 'lit/experimental-hydrate-support.js';
import {hydrate} from 'lit/experimental-hydrate.js';

// Updated
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import {hydrate} from '@lit-labs/ssr-client';
```

### Optional upgrade to standard decorators  {#standard-decorator-migration}

To use standard decorators, your decorators should add the `accessor` keyword.
Lit 3 decorators are flexible and work as both experimental decorators, and as
standard decorators.

```ts
class MyElement extends LitElement {
  // Lit 3.0 experimental decorators, which are backwards compatible with Lit 2.0
  @property()
  myProperty = "initial value"

  // Lit 3.0 adds support for standard decorators.
  // When using TypeScript:
  //  - `accessor` keyword is optional when `experimentalDecorators: true`.
  //  - `accessor` keyword is required when `experimentalDecorators: false`.
  @property()
  accessor myProperty = "initial value"

...
}
```

### Hand written getters can no longer be reactive properties {#decorated-getter}

`@property()` and `@state()` must be used on the setter for hand-written accessors,
and will throw a type error when applied on a hand written getter.

```ts
// This will throw a type error.
@property()
get myProperty () { ... }

set myProperty (val) { ... }

// Instead decorate the setter.
get myProperty () { ... }

@property()
set myProperty (val) { ... }
```
