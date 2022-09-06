---
tags: blogPosts
layout: blog-post.html
title: "Announcing Lit 2 stable release"
summary: "Lit 2: smaller, better, faster, SSR-ready, and ready for production."
date: 2021-09-21
---

Today we're announcing the stable release of Lit 2. Lit 2 is a major update: it's smaller, faster and better than before, it lays the foundation for server-side rendering, and it's all wrapped up in the new `lit` package on npm.

Lit has come a long way since April when we [announced](https://lit.dev/blog/2021-04-21-lit-2.0-meet-lit-all-over-again/) the first release candidate for Lit 2.  Since then, many partners have tested the release candidates on big applications and reported easy upgrades, better performance, and smaller bundles. In addition, some partners and community members have been exploring new features like reactive controllers and experimental server-side rendering support.

Meanwhile, at Google, we've extensively tested Lit 2 by upgrading thousands of Google's internal components to the new version.

Today we're happy to announce that Lit 2 is ready to go.

**Correction:** _The lit-analyzer CLI and VS Code Lit plugin are being updated to work with Lit 2. The original version of this post incorrectly stated that these had already been released._


## What’s in Lit 2?

Lit 2 adds a number of new features and enhancements while maintaining backward compatibility; in most cases, Lit 2 should be a drop-in replacement for previous versions. Significant new features in Lit 2 include:



*   **New directive API**. Lit 2 introduces a new class-based API for writing [custom directives](https://lit.dev/docs/templates/custom-directives/), objects that can customize how Lit renders. Directives aren't new, but the new API makes them more powerful and easier to define.

*   **Asynchronous directives**. Async directives can be notified when they are added to and removed from the DOM, which allows directives to do clean up work. For example,  an async directive could use the callbacks to subscribe and unsubscribe to an observable.
*   **Reactive controllers**. A [reactive controller](https://lit.dev/docs/composition/controllers/) is an object that can hook into a component's [lifecycle](https://lit.dev/docs/components/lifecycle/), so they can respond when the component updates, and when the component is added to or removed from the DOM. Controllers can bundle state and behavior related to a feature, making it reusable across multiple component definitions. Reactive controllers can make it easy to add state management, animations, async tasks and much more to components.
*   **Element expressions**. New in Lit 2 is the ability to add expressions that act on an element as a whole, rather than modifying a property, attribute, or the element's children. [Element expressions](https://lit.dev/docs/templates/expressions/#element-expressions) are useful for directives that need to manipulate multiple properties or to call methods on the element.

    For example, an experimental animation package, `@lit-labs/motion` provides an `animate()` directive that animates when the element's state changes. For example, the following snippet animates list items when the list reorders.

    ```js
    html`
      ${repeat(items,
        (item) => item.id,
        (item) => html`<div ${animate()}>${item}</div>`)
      }`
    ```

    For a more complete example of the `animate` directive, see the package [README](https://github.com/lit/lit/blob/main/packages/labs/motion/README.md).

*   **Static expressions**. Also new in Lit 2, [static expressions](https://lit.dev/docs/templates/expressions/#static-expressions) allow you to interpolate constant or rarely-changed values into a template before processing. Static expressions can be used in a variety of places where ordinary expressions cannot—for example, in tag-name position:


    ```js
    const tagName = literal`button`;
    html`<${tagName}></${tagName}>`
    ```


*   **SSR-ready**. Lit 2 was rebuilt to be SSR-ready. The new `@lit-labs/ssr` package implements fast, streaming SSR for Lit on Node.js. SSR support is still experimental; work is ongoing to finish and test the SSR library.

In addition to the new features in the Lit library, we've made a few more changes around Lit:

*   All Lit related projects are in a [new GitHub organization](https://github.com/lit/). Most Lit related code has been moved to a monorepo to make it easier to test changes.

*   The monorepo also includes a number of experimental projects, including [server-side rendering](https://www.npmjs.com/package/@lit-labs/ssr) support for Lit and other web components; [animation helpers](https://www.npmjs.com/package/@lit-labs/motion); and a Lit controller for [asynchronous tasks](https://www.npmjs.com/package/@lit-labs/task). Experimental projects are published under the `@lit-labs` npm scope.

*   An all-new website, [lit.dev](https://lit.dev), featuring guides, API docs, tutorials, and an interactive code editor. We launched the site with the initial Lit release candidate; since then we've added two of the most-requested features: site search, and better support for JavaScript users, with switchable JavaScript/TypeScript code snippets.


## Changes since RC 1

Since the initial RC, most changes have been bug fixes. A few notable changes:

*   Element lifecycle not paused when an element is disconnected. This reverts a change in Lit that caused some subtle bugs. If you developed an asynchronous directive using one of the Lit 2 release candidates, you may need to make some changes. For details, see [PR #2034](https://github.com/lit/lit/pull/2034).

*   Better runtime warnings in the development build. For information on using the development build, see [Development and production builds](https://lit.dev/docs/tools/development/#development-and-production-builds).


For a full list of changes, see the [changelog](https://github.com/lit/lit/blob/main/packages/lit/CHANGELOG.md).


## Get started with Lit 2

Want to try out Lit 2? Visit [lit.dev](https://lit.dev/docs/getting-started/) to get started. The site features a [catalog of interactive tutorials](https://lit.dev/tutorials) to get you started with Lit 2, an interactive [playground](https://lit.dev/playground/) for live coding, guides, and API docs.

Want to talk Lit? Join the [Lit Discord](https://lit.dev/discord/) for discussions on Lit and web components, or open a discussion on our [GitHub Discussions](https://github.com/lit/lit/discussions) board.

