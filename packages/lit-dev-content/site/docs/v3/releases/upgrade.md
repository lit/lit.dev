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

## Decorator behavior has been unified

In Lit 3.0 our decorators support running in three configurations:

1. With the TypeScript `experimentalDecorators` flag and properties without the `accessor` keyword. This is backwards compatible with Lit 2 users. As standard decorators are still immature, this is the most performant option that we recommend for production for the time being.
2. With the TypeScript `experimentalDecorators` flag and with the `accessor` keyword. This aids migration to standard decorators. Code can add the `accessor` keyword one decorator at a time to migrate gradually.
3. As standard decorators, which need the `accessor` keyword, and TypeScript 5.2 (without the `experimentalDecorators` flag), or Babel 7.23.0.

Each of these configurations is self contained. An application can mix and match libraries written in each of these configurations, and it is not generally a breaking change for a library to switch from one decorator configuration to another.

To make Lit decorators consistent between both decorator modes there have been some minor breaking
changes to experimental decorators:

- `@property` and `@state` must be used on the setter for hand-written accessors. The getter no longer works.
- `requestUpdate()` is called automatically for `@property` and `@state` decorated
  accessors where previously that was the setters responsibility.
- The value of an accessor is read on first render and used as the initial value for `changedProperties` and attribute reflection.

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
