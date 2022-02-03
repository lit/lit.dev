---
title: Bundles
eleventyNavigation:
  key: Bundles
  parent: Related libraries
  order: 4
---

Lit is available as pre-built, single-file bundles. The bundles are standard
JavaScript modules with no dependencies - any modern browser should be able to
import and run the bundles directly. These bundles are useful for situations
where you can't use npm or just want to experiment without setting up a build
process.

<div class="alert alert-warning">

**If you're using npm for client-side dependencies, you should use [the `lit`
package on npm](https://www.npmjs.com/package/lit).** The bundles intentionally
combine most or all of Lit into a single file, which can cause your page to
download more code than it needs.

</div>

## Bundle variants

There are two variants of the bundles: `core` and `all`.

The `core` bundle contains only a critical subset of Lit's features. It exports
all of the same items as the main module of the `lit` package on npm:
[`html`](/docs/api/templates/#html), [`css`](/docs/api/styles/#css),
[`render`](/docs/api/templates/#render), and
[`LitElement`](/docs/api/LitElement/#LitElement), for example.

The `all` bundle includes everything in `core` plus most other modules in the
`lit` package. [`html`](/docs/api/static-html/#html) and
[`svg`](/docs/api/static-html/#svg) from `lit/static-html.js` are renamed
`staticHtml` and `staticSvg` respectively to avoid name collisions.

<div class="alert alert-warning">

**Don't use more than one bundle in your project.** The bundles each contain
full copies of overlapping content. If you need to switch bundles, you should
update every bundle reference in your project to point to the new bundle.

</div>

## Getting the bundles

### From GitHub

The bundles can be found on GitHub in [the lit/dist
repository](https://github.com/lit/dist). Go to [the repository's
tags](https://github.com/lit/dist/tags), find the version you want, and click
either the "zip" or "tar.gz" link to download an archive of the bundles in the
chosen format.

The archive has a directory for each variant that contains the bundle and its
source map. For example, if you extracted the bundles into a directory called
`lit-bundles` next to one of your source files, you could use the `core` bundle
in that source file like this:

```js
import {LitElement, html} from './lit-bundles/core/lit-core.min.js';
```

### From a CDN

You can also import the bundles from CDNs that serve assets directly from
repositories hosted on GitHub. For example, you could import the latest `v2`
release of [the `core` bundle](#core) from [jsDelivr](https://jsdelivr.com) like
this:

```js
import {LitElement, html} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
```

See [jsDelivr's 'Features'
page](https://www.jsdelivr.com/features#:~:text=GitHub%20CDN) for more
information on how to format the URL.
