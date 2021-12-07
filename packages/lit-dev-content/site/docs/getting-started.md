---
title: Getting Started
eleventyNavigation:
  key: Getting Started
  parent: Introduction
  order: 3
versionLinks:
  v1: getting-started/
---

There are many ways to get started using Lit, from our Playground and interactive tutorial to installing into an existing project.

## Lit Playground

Get started right away with the interactive playground and examples. Start with "[Hello World](/playground)", then customize it or move on to more examples.

## Interactive tutorial

Take our [step-by-step tutorial](/tutorial/) to learn how to build a Lit component in minutes.

## Lit starter kits

We provide TypeScript and JavaScript component starter kits for creating standalone reusable components. See [Starter Kits](/docs/tools/starter-kits/).

## Install locally from npm

Lit is available as the `lit` package via npm.

```sh
npm i lit
```

Then import into JavaScript or TypeScript files:

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
```

```js
import {LitElement, html} from 'lit';
```

{% endswitchable-sample %}

## Add Lit to an existing project

See [Adding Lit to an existing project](/docs/tools/adding-lit) for instructions on adding Lit to an existing project or application.

## Open WC project generator

The Open WC project has a [project generator](https://open-wc.org/docs/development/generator/) that can scaffold out an application project using Lit.
