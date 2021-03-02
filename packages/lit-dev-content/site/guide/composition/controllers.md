---
title: Controllers
eleventyNavigation:
  parent: Composition
  key: Controllers
  order: 4
---

## Introduction

Lit 2 introduces a new concept for code reuse and composition called "Reactive Controllers".

A reactive controller is an object that can hook into a component's reactive update cycle. Controllers can bundle state and behavior related to a feature, maing it reuseable across multiple component definitions.

You can use controllers to implement features that require their own state and access to the component's lifecycle, such as:

* Handling global events like mouse events
* Managing asynchronous tasks like fetching data over the network
* Running animations

Reactive controllers can be thought of as partial reusable component definitions, with their own identity and state. They allow you to build components by composing smaller pieces that aren't themselves components.

### Example

{% playground-ide "docs/controllers/overview" "my-element.ts" %}

Reactive controllers are similar in many ways to class mixins. The main difference is that they have their own identity and don't add to the component's prototype, which helps contain their APIs and lets you use multiple controller instances per host component. See [Controllers vs Mixins](#controllers-vs-mixins) for more details.

## Using a Controller

Each controller has its own creation API, but typically you will create an instance and store it with the component:

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

The component associated with a controller instance is called the host component.

The controller instance registers itself to receive lifecycle callbacks from the host component, and triggers a host update when the controller has new data ro render. This is how the ClockController example periodically renders the current time.

A controller will typically expose some functionality to be used in the host's `render()` method. For example, many controllers will have some state, like a current value:

```ts
  render() {
    return html`
      <div>Current time: ${this.clock.time}</div>
    `;
  }
```

Since each controller has it's own API, refer to specific controller documentation on how to use them.

## Writing a Controller

Reactive controllers can be implemented in a number of ways, but we'll focus on using JavaScript classes, with constructors for initialization and methods for lifecycles.

### Controller Initialization

A controller registers itself with its host component by calling `host.addController(this)`. Usually a controller stores a reference to its host component so that it can interact with it later.

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    // Store a reference to the host
    this.host = host;
    // Register for lifecycle updates
    host.addController(this);
  }
}
```

You can add other constructor parameters for one-time configuration.

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;
  delay: number

  constructor(host: ReactiveControllerHost, delay: number) {
    this.host = host;
    this.delay = delay;
    host.addController(this);
  }
```

Once your controller is registered with the host component, you can add lifecycle callbacks and other class fields and methods to the controller to implement the desired state and behavior.

### Lifecycle

The reactive controller lifecycle is a subset of the reactive update cycle. LitElement calls into any installed controllers during its lifecycle callbacks. These callbacks are optional.

* `hostConnected()`:
  * Called when the host is connected.
  * Called after creating the renderRoot, so a shadow root will exist at this point.
  * Useful for seting up event listeners, observers, etc.
* `hostUpdate()`:
  * Called before the host's `update()` and `render()` methods.
  * Useful for reading DOM before it's updated (eg, for animations).
* `hostUpdated()`:
  * Called after updates, before the host's `updated()` method.
  * Useful for reading DOM after it's modified (for example, for animations).
* `hostDisconnected()`:
  * Called when the host is disconnected.
  * Useful for cleaning up event listeners, observers, etc.

### Controller Host API

A reactive controller host implements a small API for adding controllers and requesting updates, and is responsible for calling its controller's lifecycle methods.

This is the minimum API exposed on a controller host:

* `addController(controller: ReactiveController)`
* `removeController(controller: ReactiveController)`
* `requestUpdate()`
* `updateComplete: Promise<boolean>`

You can also create controllers that are specific to HTMLElement, ReactiveElement, LitElement and require more of those APIs, or even controllers that are tied to a specific element class or other interface.

LitElement and ReactiveElement are controller hosts, but hosts can also be other objects like base classes from other web components libraries, components from frameworks, or other controllers.

### Building controller from other controllers

Controllers can be composed of other controllers as well. To do this create a child controller and forward the host to it.

```ts
class DualClockController implements ReactiveController {
  private clock1: ClockController;
  private clock2: ClockController;

  constructor(host: ReactiveControllerHost, delay1: number, delay2: number) {
    clock1 = new ClockController(host, delay1);
    clock2 = new ClockController(host, delay2);
  }

  get time1() { return this.clock1.time; }
  get time2() { return this.clock2.time; }
}
```

### Controllers and Directives

Combining controllers with directives can be a very powerful technique, especially for directives that need to do work before or after rendering, like animation directives; or controllers that need references to specific elements in a template.

There are two main patterns of using controllers with directives:
* Controller Directives. These are directives that themselves are controllers in order to hook the host lifecycle.
* Controllers that own directives. These are controllers that the host creates that may create one or more directives for use in templates.
Controller Directives

Reactive controllers do not need to be stored as instance fields on the host. Anything added to a host using `addController()` is a controller. In particular, a directive can also be a controller. This enables a directive to hook into the host lifecycle.

{% todo %}

- Link to directive doc

{% endtodo %}

#### Controller that own Directives

{% todo %}

- Describe
- Example

{% endtodo %}

## Controllers vs Mixins

Controllers and class mixins are very similar in some ways. They both can hook into a host component's lifecycle, maintain state, and trigger updates.

The main difference is that controllers enable a "has-a" relationship with a component - a host "has" controllers - while mixins enable a "is-a" relationship - a host "is" an instance of the mixins applied to it.

The difference is in composition vs inheritance, which each have their own uses, advantages and disadvantages. While mixins fix a lot of the traditional problems with inheritance (such as the inability to inherit from multiple super classes), composition can still be better in many cases.

### Advantages of controllers:

* A host can have multiple instances of the same controller type, but only one of a mixin. Multiple controllers of the same type can be very useful with things like tasks, queries or state management, animations, etc.
* Controller state is easily naturally grouped with the controller instance. Mixins can sometimes add a lot of fields and methods to a class. Controllers keep their own fields and methods and the name of the controller field is assigned by the component author.
* Controllers may be easier to use in smart IDEs. The code-completion results for `this.` on a class with a mixin include all of the component's inherited members, which can be a long list. The code-completion results for `this._myController` will only include the members of the controller.

### Advantages of mixins:
* Controller lifecycle methods are called before the host's work for that lifecycle, whereas mixins can do work before or after the super call to the host's lifecycle. If you need fine-grained control over lifecycle timing, you may want to use a mixin.
* Mixins can add public API to the component.

It's a good idea to choose reactive controllers by default, and use mixins when you need to.

## Use Cases

### External Inputs

Reactive controllers can be used to connect external inputs, like keyboard and mouse events; resize, intersection or mutation observers; etc; to a component. The controller can provide the current value of the input to use in rendering, and request a host update when the value changes.

#### Example: MouseMoveController

This example shows how a controller can perform setup and cleanup work when its host is connected and disconnected, and request an update when an input changes:

{% playground-ide "docs/controllers/mouse" "my-element.ts" %}

### Asynchronous Tasks

Asynchronous tasks, such as long running computations or network I/O, typically have state that changes over time, and will need to notify the host when the task state changes (completes, errors, etc.).

Controllers are a great way to bundle task execution and state to make it easy to use inside a component. A task written as a controller usually has inputs that a host can set, and outputs that a host can render.

`@lit-labs/task` contains a generic `Task` controller that can pull inputs from the host, execute a task function, and render different templates depending on the task state.

You can use `Task` to create a custom controller with an API tailored for your specific task. Here we wrap `Task` in a `ForexController` that can fetch foreign exchange data from a REST API. `ForexController` exposes a `currency` property as an input, and a `render()` method that can render one of four templates depending on the task state. The task logic, and how it updates the host, are abstracted from the host component.

{% playground-ide "docs/controllers/forex" "my-element.ts" %}

### Animations

{% todo %}

- Write

{% endtodo %}

## See Also

* ReactiveElement
* LitElement/Reactive Lifecycle
* @lit-labs/task
* Controller examples in the playground
