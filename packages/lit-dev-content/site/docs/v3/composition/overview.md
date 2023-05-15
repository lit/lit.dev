---
title: Composition overview
eleventyNavigation:
  parent: Composition
  key: Overview
  order: 1
versionLinks:
  v2: composition/overview/
---

Composition is a strategy for managing complexity and organizing code into reusable pieces. Lit provides a few options for composition and code reuse:

*   Component composition.
*   Reactive controllers.
*   Class mixins.

[_Component composition_](/docs/v3/composition/component-composition/) is the process of assembling complex components from simpler components. A component can use subcomponents in its template. Components can use standard DOM mechanisms to communicate: setting properties on subcomponents, and listening for events from subcomponents.

Although component composition is the default way to think about breaking a complex Lit project down into smaller units, there are two other notable code patterns useful for factoring your Lit code:

[_Reactive controllers_](/docs/v3/composition/controllers/) are objects that can hook into the update lifecycle of a Lit component, encapsulating state and behavior related to a feature into a separate unit of code.

[_Class mixins_](/docs/v3/composition/mixins/) let you write reusable partial component definitions and "mix them in" to a component's inheritance chain.

Both mixins and reactive controllers let you factor component logic related to a given feature into a reusable unit. See the next section for a comparison of controllers and mixins.

## Controllers and mixins

Controllers and class mixins are very similar in some ways. They both can hook into a host component's lifecycle, maintain state, and trigger host updates.

The primary difference between controllers and mixins is their relationship with the component. A component has a "has-a" relationship with a reactive controller, since it owns the controller. A component has an "is-a" relationship with a mixin, since the component is an instance of the mixin class.

A reactive controller is a separate object owned by a component. The controller can access methods and fields on the component, and the component can access methods and fields on the controller. But the controller can't (easily) be accessed by someone using the component, unless the component exposes a public API to it. The controller's lifecycle methods are called _before_ the corresponding lifecycle method on the component.

A mixin, on the other hand, becomes part of the component's prototype chain. Any public fields or methods defined by the mixin are part of the component's API. And because a mixin is part of the prototype chain, your component has some control of when the mixin's lifecycle callbacks are called.

In general, if you're trying to decide whether to package a feature as a controller or a mixin, you should choose a controller _unless_ the feature requires one of the following:

*   Adding public API to the component.
*   Very granular access to the component lifecycle.
