---
title: Components overview
eleventyNavigation:
  key: Overview
  parent: Components
  order: 0
versionLinks:
  v1: components/templates/
  v3: components/overview/
---

A Lit component is a reusable piece of UI. You can think of a Lit component as a container that has some state and that displays a UI based on its state. It can also react to user input, fire events—anything you'd expect a UI component to do. And a Lit component is an HTML element, so it has all of the standard element APIs.

Creating a Lit component involves a number of concepts:

 *   [Defining a component](/docs/v2/components/defining/). A Lit component is implemented as a *custom element*, registered  with the browser.

 *   [Rendering](/docs/v2/components/rendering/). A component has *render method* that's called to render the component's contents. In the render method, you define a *template* for the component.

*   [Reactive properties](/docs/v2/components/properties/). Properties hold the state of the component. Changing one or more of the components' _reactive properties_ triggers an update cycle, re-rendering the component.

*   [Styles](/docs/v2/components/styles/). A component can define _encapsulated styles_ to control its own appearance.

*   [Lifecycle](/docs/v2/components/lifecycle/). Lit defines a set of callbacks that you can override to hook into the component's lifecycle—for example, to run code when the element's added to a page, or whenever the component updates.

Here's a sample component:

{% playground-example "v2-docs/components/overview/simple-greeting" "simple-greeting.ts" %}
