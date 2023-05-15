---
title: Upgrade guide
eleventyNavigation:
  key: Upgrade guide
  parent: Releases
  order: 3
versionLinks:
  v2: releases/upgrade/
---

## Overview

Lit 3.0 has very few breaking changes from Lit 2.0. Any projects using Lit 2
without deprecation warnings should not require any changes to upgrade to Lit 3.

Lit 3.0:

- Drops support for IE11
- Is published as ES2021
- Removes a couple deprecated APIs

Lit 3.0 should require no changes to upgrade from Lit 2.0 for the vast majority
of users. Most apps and libraries should be able to extend their npm version
ranges to include both 2.x and 3.x, like `"^2.7.0 || ^3.0.0"`.

Lit 2.x and 3.0 are _interoperable_: templates, base classes, directives,
decorators, etc., from one version of Lit will work with those from another.

The following sections will go through each of these changes in detail. Please
file any issues you find on our [issue
tracker](https://github.com/lit/lit/issues).

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
import { UpdatingElement } from "lit";

// Updated
import { ReactiveElement } from "lit";
```

### Removed re-export of decorators from `lit-element` {#removed-re-export-decorators}

Lit 3.0 [built-in
decorators](/docs/v3/components/decorators/#built-in-decorators) are no longer
exported by `lit-element`, and should instead be imported from
`lit/decorators.js`.

```ts
// Removed decorator exports from lit-element
import { customElement, property, state } from "lit-element";

// Updated
import { customElement, property, state } from "lit/decorators.js";
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
import 'lit/experimental-hydrate-support.js'
import {hydrate} from 'lit/experimental-hydrate.js';

// Updated
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import {hydrate} from '@lit-labs/ssr-client';
```
