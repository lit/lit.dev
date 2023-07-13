---
tags: blogPosts
layout: blog-post.html
title: "LitElement 3.0 & lit-html 2.0: Early Preview Release"
summary: "Preview the next major versions of LitElement and lit-html."
date: 2020-09-22
---

Today we’re publishing the first preview releases of the next major versions of
our flagship libraries, LitElement and lit-html.

These releases include most of the breaking changes we intend to make, and most
of the functionality we want to carry over from the previous versions. They are
not yet feature complete or fully API stable. Notably, they don’t yet support
legacy browsers like IE11, or browsers requiring the web components polyfill.

## Motivation

We’ve been very happy with the current versions of our libraries—they’re fast,
small, and stable (yay!)—and in some ways we don’t have very many pressing needs
to make breaking changes. We don’t make breaking changes lightly. But there are
some compelling reasons for changes that we think will improve the
user-experience of components and applications built with LitElement.

1. **Performance**

   We have found that some of our browser-bug workaround code and customization
   abstractions prevent optimizations that we would like to do.

2. **Size**

	 That same code, and our extensive public API, costs bytes. We always
   want to find ways to make the libraries smaller.

3. **Features & API cleanup**

   Some features are difficult to add in a
   cost-effective way with the current architecture, or can’t really be improved
   without breaking changes.

4. **Server-side-rendering**

   lit-html has an extremely flexible and customizable API, and in some ways is
   more of a template-system construction kit than a single template-system. But
   this flexibility complicates SSR, which needs to make assumptions about how
   the server-rendered HTML maps to templates. SSR would only work well with the
   default, uncustomized lit-html, so limiting customization makes SSR more
   reliable. Very few developers used the customization APIs anyway.

We also want to make the directive API SSR compatible by limiting access to the
DOM.

## What’s changed

These are new major versions, so there are some breaking changes, but we want to
minimize disruption to our users as much as possible. We’ve limited the breaking
changes so that they don’t affect most users, or only require a mechanical
change (like changing an import).

Please see the READMEs
([LitElement](https://github.com/lit/lit/tree/lit-next/packages/lit-element#readme),
[lit-html](https://github.com/lit/lit/tree/lit-next/packages/lit-html#readme))
and CHANGELOGs
([LitElement](https://github.com/lit/lit/blob/lit-next/packages/lit-element/CHANGELOG.md),
[lit-html](https://github.com/lit/lit/blob/lit-next/packages/lit-html/CHANGELOG.md))
for the most detailed list of changes.

The most important changes:

- Customizing the syntax of lit-html is no longer directly supported. The
  templateFactory and TemplateProcessor APIs have been removed.

- The public API has been minimized in order to facilitate better minification
  and future evolution.

- The lit-html directive API has changed to be class-based and to persist
  directive instances. Directives should be easier to write and easier to make
  SSR compatible.

- The LitElement decorators are no longer exported from the main module—they
  have to be imported individually or from a new `lit-element/decorators.js`
  module. This means smaller app sizes for non-decorator-users and opens the
  door to new decorators implementing the current TC39 JavaScript proposal when
  those arrive.

- lit-html no longer uses `instanceof` or module-level WeakMaps to detect
  special objects like template results and directives, which should improve the
  compatibility of multiple copies of lit-html in a single app. We still
  recommend de-duping npm packages, but more cases will work now.

- Safari 12 has a critical [template literal
  bug](https://bugs.webkit.org/show_bug.cgi?id=190756), which is no longer
  worked around in lit-html. If you support Safari 12 you will have to compile
  template literals to their ES5 equivalent. Note that babel-preset-env already
  does this for the broken versions of Safari.

There are smaller changes listed in the change logs. Overall we hope these
versions are drop in replacements for most users, or only require updating
decorator imports.

## Installation

Run:
```sh
npm i lit-element@next-major
```

And/or:
```sh
npm i lit-html@next-major
```

## Submitting feedback

We’re in the process of moving the next versions of LitElement and lit-html into
a mono-repo. Please file issues on the [current lit-html
repo](https://github.com/lit/lit/issues), using a prefix of
`[lit-html]` or `[lit-element]`. We expect that, as with any pre-release, there
will be common issues we will have to fix. Please search for your issue first.
Issues for the next major versions will have the label lit-next.

## What’s next

For the next preview release we will be focusing on browser and polyfill
support, especially IE11.
