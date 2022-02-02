---
title: Bundles
eleventyNavigation:
  key: Bundles
  parent: Related libraries
  order: 4
---

Lit is available as pre-built, single-file bundles. These bundles are useful for
situations where you can't use npm or just want to experiment without setting up
a build process.

<div class="alert alert-warning">

**If you're using npm for client-side dependencies, you should use the [`lit`
package](https://www.npmjs.com/package/lit) instead of these bundles.** The
bundles intentionally combine most or all of Lit into a single file. This can
prevent some build tools from removing the parts of Lit your project doesn't
use, which means your users may download more code than they strictly need.

</div>

## Download

The bundles can be found on GitHub in [the lit/dist
repository](https://github.com/lit/dist). To download a particular version, go
to [the repository's tags](https://github.com/lit/dist/tags), find the version
you want, and click either the "zip" or "tar.gz" link to download an archive of
the bundles in the chosen format.

## Usage

The archive has multiple folders, each containing a bundle and its source map.
The bundles are standard JavaScript modules with no dependencies - any modern
browser should be able to import and run the bundles directly.

For example, if you extracted the bundles into a directory called `lit-bundles`
next to one of your source files, you could use the `core` bundle in that source
file like this:

```js
import {LitElement, html} from './lit-bundles/core/lit-core.min.js';
```

### Source maps

Each bundle directory includes a source map. If you want to be able to view
Lit's unminified sources while debugging, keep this file in the same directory
as its associated bundle and don't rename it. If you update your project's
bundle, you also need to update its source map.

## CDN

As an alternative to hosting your own copy of Lit's bundles, you can also import
them from CDNs that serve assets directly from repositories hosted on GitHub.

For example, you could import the latest `v2` release of [the `core`
bundle](#core) from [jsDelivr](https://jsdelivr.com) like this:

```js
import {LitElement, html} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
```

See [jsDelivr's features
page](https://www.jsdelivr.com/features#:~:text=GitHub%20CDN) for more
information on how to format the URL.

## Bundle variants

Two bundles are currently available: `core` and `all`.

<div class="alert alert-warning">

**Don't use more than one bundle in your project.** The bundles each contain
full copies of overlapping content. If you need to switch bundles, you should
update every bundle reference in your project to point to the new bundle.

</div>

### `core/`

- `lit-core.min.js` - the `core` bundle
- `lit-core.min.js.map` - the `core` bundle's source map

The `core` bundle contains only a critical subset of Lit's features. It exports
all of the same items as the main module of the `lit` npm package:
[`html`](/docs/api/templates/#html), [`css`](/docs/api/styles/#css),
[`render`](/docs/api/templates/#render), and
[`LitElement`](/docs/api/LitElement/#LitElement), among others.

### `all/`

- `lit-all.min.js` - the `all` bundle
- `lit-all.min.js.map` - the `all` bundle's source map

The `all` bundle includes everything in the `core` bundle as well as [all
built-in directives](/docs/templates/directives/), [async and custom directive
helpers](/docs/api/custom-directives/), and [static
templating](/docs/api/static-html/). In this bundle, the static
[`html`](/docs/api/static-html/#html) and [`svg`](/docs/api/static-html/#svg)
template tags are renamed to `staticHtml` and `staticSvg` to avoid colliding
with the names of the normal [`html`](/docs/api/templates/#html) and
[`svg`](/docs/api/templates/#svg) template tags.
