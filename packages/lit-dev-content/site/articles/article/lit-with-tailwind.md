---
title: Lit components with tailwind styles
publishDate: 2023-12-10
lastUpdated: 2023-12-10
summary: Using tailwind styles inside Lit components
thumbnail: /images/articles/lit_with_tailwind
tags:
  - web-components
  - tailwind
  - css
eleventyNavigation:
  parent: Articles
  key: Lit with tailwind
  order: 0
author:
  - james-garbutt
---

Tailwind and many other CSS libraries were not designed with web components in
mind, and come with some non-obvious difficulties when trying to use them in
such a codebase.

This is a brief guide on how to use such a library with your Lit components.

## Why tailwind doesn't work out of the box

Out of the box, tailwind basically provides some global CSS classes and injects
the associated CSS at build time (via postcss).

This conflicts with how web components work, since each web component has its
own natively scoped stylesheet rather than inheriting any global styles. This
is why Tailwind will not be much use to us without further setup.

## Overview of solution

To solve the gaps tailwind comes with, we will:

- Inject tailwind styles into regular CSS files
- Use [import attributes](https://github.com/tc39/proposal-import-attributes)
to import those CSS files
- Use [esbuild](https://github.com/evanw/esbuild) to pull those CSS files
into the bundle or same output directory

## Initial setup

To begin, we need the following dependencies for our build:

- `esbuild` for bundling our code and carry our CSS files across (via imports)
- `postcss` for injecting tailwind styles
- `tailwindcss` for tailwind itself (postcss plugin)

We can install these like so:

```sh
npm install -D esbuild postcss postcss-cli tailwindcss
```

In our case, we are going to use `postcss-cli` for processing our CSS files. If
you use rollup or another bundler already, you may be able to use a postcss
plugin instead.

## Using CSS imports

When creating components, we want to use
[import attributes](https://github.com/tc39/proposal-import-attributes) to
import our CSS files rather than embedding CSS in our sources.

**However, at the time of writing this article, the new `with` syntax is not
fully supported**. Temporarily, we still have to use the old `assert` syntax,
until esbuild implements full support for the new standard.

We can do this like so:

```ts
import myElementStyles from './my-element.css' assert {type: 'css'}

class MyElement extends LitElement {
  static styles = myElementStyles;

  render() {
    return html`
      <span class="italic">I am italic tailwind text</span>
    `;
  }
}
```

As you can see, we want our `my-element.css` file to contain tailwind
mixins, and we want to use the resulting classes in our element's `render`
method.

The CSS file (`my-element.css`) would look like this:

```css
@tailwind base;
@tailwind utilities;

/* other custom CSS here */
```

We will then use tailwind to replace those mixins with CSS, including only
the styles our `render` method referenced.

## Configuring tailwind and postcss

Before we run our build, we need to configure tailwind and postcss.

In our `tailwind.config.js`, we can write:

```ts
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.ts'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Tailwind [configuration](https://tailwindcss.com/docs/configuration) can be
modified to fit your use case. The important part is for `content` to specify
where our component sources are so tailwind can detect which classes we have
used.

In our `postcss.config.js`, we simply want to tell postcss to use tailwind
as a plugin:

```ts
export default {
  plugins: {
    tailwindcss: {}
  }
};
```

## Build scripts

We're going to do a few steps in our build:

1. Bundle our sources (TypeScript in this case, including our CSS imports)
2. Apply tailwind styles to the build output in-place

To do this, we can use an npm script:

```json
{
  "scripts": {
    "build:js": "esbuild --format=esm --bundle --loader:.css=copy --outfile=bundle.js src/main.ts",
    "build:css": "postcss -r \"./*.css\"",
    "build": "npm run build:js && npm run build:css"
  }
}
```

You can see the magic here in our `build:js` script is esbuild's `--loader`
option, which we have set to `.css=copy`. This basically means any CSS files we
import via an ESM import statement will be copied across to the same directory
as the esbuild JS output (`bundle.js` in our case).

So if we import `my-element.css`, we will expect two files in our directory:

- `my-element.css` (probably under another name, using esbuild's chunk naming)
- `bundle.js`

Finally, the `build:css` script then _replaces_ (via the `-r` flag) those CSS
files with copies which now have the tailwind styles injected.

## Run it!

We now have a `build` script! You can run this via `npm run build` and should
see two new files appear as mentioned before.

## Expressions in styles (dynamic styles)

You may have noticed one thing we have lost by having our CSS in external
files: we can no longer template variables into our CSS like so:

```ts
static styles = css`
  .foo {
    color: ${dynamicColourDefinedInJs};
  }
`;
```

There are many challenges in supporting this usage and still passing it through
tailwind. For this reason, **it is not recommended**.

Instead, in places we really need to do this, we should use CSS variables or
do the computation statically at build-time (replace values in our CSS at
build time).

To solve this with CSS variables, we can do the following:

`my-element.css`:

```css
.foo {
  color: var(--foo-color);
}
```

`my-element.ts`:

```ts
static styles = [
  css`
    :host {
      --foo-color: ${dynamicColour};
    }
  `,
  myElementStyles
];
```

The initial `styles` entry in this case is only being used for setting the
values of some CSS variables, and never used for actual styling. We can then
reference those variables in our external CSS files.

## Example

An example repository very similar to this guide is available here:

https://github.com/43081j/tailwind-lit-example
