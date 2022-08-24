---
title: Lit Labs
eleventyNavigation:
  key: Lit Labs
  parent: Related libraries
  order: 3
---

Lit Labs is an umbrella for projects related to Lit that aren't quite ready for production. These projects may be experimental or incomplete, and they're subject to breaking changes. Lit Labs projects are published under the `@lit-labs` npm scope.

Feedback is currently being solicited on the following Labs packges:

| Package | Description | Docs | Feedback |
|-|-|-|-|
| [motion](https://www.npmjs.com/package/@lit-labs/motion) | Animation helpers for Lit templates. This package includes an `animate` directive for adding tweening animations when an element changes state, as well as an `AnimateController` class for programmatically controlling and coordinating animations. You can find a number of motion examples in the [Playground](https://lit.dev/playground/#sample=examples/motion-simple). | [Readme](https://github.com/lit/lit/tree/main/packages/labs/motion#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [react](https://www.npmjs.com/package/@lit-labs/react) | React integration helpers for custom elements and reactive controllers. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/react#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [scoped-registry-mixin](https://www.npmjs.com/package/@lit-labs/scoped-registry-mixin) | Mixin for Lit that integrates with the speculative [Scoped CustomElementRegistry polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/scoped-custom-element-registry). | [Readme](https://github.com/lit/lit/tree/main/packages/labs/scoped-registry-mixin#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [ssr](https://www.npmjs.com/package/@lit-labs/ssr) | A package for server-side rendering Lit templates and components. | [Docs](/docs/ssr/overview)<br>[Readme](https://github.com/lit/lit/tree/main/packages/labs/ssr#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [task](https://www.npmjs.com/package/@lit-labs/task) | A reactive controller for handling asynchronous tasks. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/task#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [virtualizer](https://www.npmjs.com/package/@lit-labs/virtualizer) | An element that provides viewport-based virtualization (including virtual scrolling). | [Readme](https://github.com/lit/lit/tree/main/packages/labs/virtualizer#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [observers](https://www.npmjs.com/package/@lit-labs/observers) | A set of reactive controllers that facilitate using the platform observer objects, including `MutationObserver`, `ResizeObserver`, `IntersectionObserver`, and `PerformanceObserver`. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/observers#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [context](https://www.npmjs.com/package/@lit-labs/context) | A package containing controllers and decorators for using the [Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) as defined by the Web Components Community Group. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/context#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [router](https://www.npmjs.com/package/@lit-labs/router) | A component-oriented router API vended as reactive controllers. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/router#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [eleventy-plugin-lit](https://www.npmjs.com/package/@lit-labs/eleventy-plugin-lit) | A plugin for [Eleventy](https://www.11ty.dev) that pre-renders Lit components at build time, with optional hydration. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |
| [testing](https://www.npmjs.com/package/@lit-labs/testing) | A package containing testing utilities for Lit including generated server-side rendered fixtures. | [Readme](https://github.com/lit/lit/tree/main/packages/labs/testing#readme) | [Discussion](https://github.com/lit/lit/discussions)<br>[File issue](https://github.com/lit/lit/issues/new/choose) |


When a Lit Labs project is ready for production it may be migrated to a new location outside of Lit Labs. For example, the [`@lit/localize`](/docs/localization/overview/) package started out as a Lit Labs project.
