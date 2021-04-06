---
title: Getting Started
eleventyNavigation:
  key: Getting Started
  parent: Introduction
  order: 3
---

There are many ways to get started using Lit, from our Playground and interactive tutorial to installing into an exising project.

## Lit Playground

Get started right away with the interactive playground and examples. Start with editable "Hello World" examples in JavaScript and TypeScript, then customize them or move on to more examples.

* [Hello World (TypeScript)](/playground/#sample=examples/hello-world-typescript)
* [Hello World (JavaScript)](/playground/#sample=examples/hello-world-javascript)

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

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
```

## Add Lit to an existing project

See [Adding Lit to an existing project](/docs/tools/adding-lit) for instructions on adding Lit to an existing project or application.

## Open WC project generator

The Open WC project has a [project generator](https://open-wc.org/docs/development/generator/) that can scaffold out an application project using LitElement.
