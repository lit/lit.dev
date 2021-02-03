---
title: Overview
eleventyNavigation:
  parent: Composition
  key: Overview
  order: 1
---

There are several strategies you can use to factor Lit code into reusable modules:

*   Composition
*   Directives
*   Reactive controllers
*   Class mixins

_Composition_ is the process of assembling complex components from simpler components. A component can use subcomponents in its template. Components can use standard DOM mechanisms to communicate: setting properties on subcomponents, and listening for events from subcomponents.

_Directives_ are functions that can customize how Lit renders values. Unlike a simple function in a template expression, a directive can hold state between render cycles, and directly manipulate the generated DOM.  Directives are useful for code that needs to customize rendering in some fashion.

_Reactive controllers_ are objects that can hook into the update lifecycle of a Lit component, encapsulating state and behavior related to a feature into a separate unit of code.

_Class mixins_ let you write reusable partial component definitions and "mix them in" to a component's inheritance chain.

Both mixins and reactive controllers let you group code related to a feature into a reusable unit. However, they're applied in different ways.

A reactive controller is a separate object connected to a component. The controller can access methods and fields on the component, and the component can access methods and fields on the controller. But the controller can't (easily) be accessed by someone using the component, unless the component exposes a public API to it. The controller's lifecycle methods are called _before_ the corresponding lifecycle method on the component.

A mixin, on the other hand, becomes part of the component's prototype chain. Any public fields or methods defined by the mixin are part of the component's API. And because a mixin is part of the prototype chain, your component has some control of when the mixin's lifecycle callbacks are called.

In general, if you're trying to decide whether to package a feature as a controller or a mixin, you should choose a controller _unless_ the feature requires one of the following:

*   Adding public API to the component.
*   Very granular access to the component lifecycle.
