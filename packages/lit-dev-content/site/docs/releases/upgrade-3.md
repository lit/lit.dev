---
title: Upgrade guide for Lit 3
eleventyNavigation:
  key: Upgrade guide for Lit 3
  parent: Releases
  order: 3
---

## Overview

Lit 3.0 has very few breaking changes from Lit 2.0:

- Drops support for IE11
- Published as ES2021
- Removes a couple of deprecated Lit 1.x APIs

Lit 3.0 should require no changes to upgrade from Lit 2.0 for the vast majority of users. Once the full release is published, most apps and libraries will be able to extend their npm version ranges to include both 2.x and 3.x, like `"^2.7.0 || ^3.0.0"`.

Lit 2.x and 3.0 are _interoperable_: templates, base classes, directives, decorators, etc., from one version of Lit will work with those from another.

Please file any issues you find on our [issue tracker](https://github.com/lit/lit/issues).


<!-- TODO: Maybe generate the release notes and keep any with public facing impact here? -->
See the [Lit 3.0 release notes](TODO) for a full list of changes.
