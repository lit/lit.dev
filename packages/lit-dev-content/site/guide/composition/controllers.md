---
title: Controllers
eleventyNavigation:
  parent: Composition
  key: Controllers
  order: 4
---

{% todo %}

- Write section. [#1194](https://github.com/Polymer/internal/issues/1194)

{% endtodo %}

## Introduction

Lit 2 introduces a new concept for code reuse and composition called "Reactive Controllers".

A reactive controller is an object that can hook into a component's update lifecycle, allowing it to bundle state and behavior related to a feature, and reuse it across multiple component definitions.

You can use controllers to implement features that require their own state and access to the component's lifecycle, such as:

* Handling global events like mouse events.
* Managing asynchronous tasks like fetching data over the network.
* Running animations.

Reactive controllers can be thought of as partial reusable component definitions, with their own identity and state. They allow you to build components by composing smaller pieces that aren't themselves components.

Reactive controllers are similar in many ways to class mixins. The main difference is that they have their own identity and don't add to the component's prototype, which helps contain their APIs and lets you use multiple controller instances per host component. See [Controllers vs Mixins](#controllers-vs-mixins) for more details.

## Using a Controller

Each controller has its own creation API, but typically you will create an instance and store it with the component:

```ts
class MyElement extends LitElement {
  _clock = new ClockController(this, 1000);
}
```

The controller instance registers itself to receive lifecycle callbacks from the component. The component associated with a controller instance is called the host component.

A controller will typically expose some functionality to be used in the host's `render()` method. For example, many controllers will have some state, like a current value:

```ts
class MyElement extends LitElement {
  _clock = new ClockController(this, 1000);

  render() {
    html`
      <div>Current time: ${this._clock.time}</div>
    `;
  }
}
```

## Writing a Controller

Reactive controllers can be implemented with JavaScript classes.

A controller needs a reference to its host component so that it can register itself and interact with the component later:

```ts
import {ReactiveController, ReactiveControllerHost} from 'lit';

class ClockController implements ReactiveController {
  host: ReactiveControllerHost;
  delay: number;
  time: Date;
  _intervalID?: number;

  constructor(host: ReactiveControllerHost, delay: number) {
    this.host = host;
    this.delay = delay;
    this.time = new Date();
    host.addController(this);
  }

  _onTick = () => {
    this.time = new Date();
    this.host.requestUpdate();
  };

  hostConnected() {
    this._intervalID = setInterval(this._onTick, this.delay);
  }

  hostDisconnected() {
    clearInterval(this._intervalID);
  }
}
```

You can add class fields and methods to the controller to implement its specific state and behavior.

### Lifecycle

The reactive controller lifecycle closely matches the LitElement (ReactiveElement) lifecycle. LitElement calls into any installed controllers during its lifecycle callbacks. These callbacks are optional, if a controller implements them, they are called.

* `hostConnected()`: Called from connectedCallback, after creating the renderRoot, so a shadow root will exist at this point.
Set up event listeners, observers, etc.
Not called in server environments.
* `hostUpdate()`: Called before the host's update() and render() methods.
Useful for reading DOM before it's modified (for example, for animations).
Not called in server environments.
* `hostUpdated()`: Called before the host's updated() method.
Useful for reading DOM after it's modified (for example, for animations).
Not called in server environments.
* `hostDisconnected()`: Called from host's disconnectedCallback.
Clean up event listeners, observers, etc.
Not called in server environments.

### Controller Host API

A reactive controller host implements a simple API for adding controllers, requesting updates, and is responsible for calling its controller's lifecycle methods. LitElement and ReactiveElement are controller hosts, but hosts can potentially be other objects like base classes from other web components libraries, components from frameworks, or other controllers.

* `addController(controller: ReactiveController)`
* `removeController(controller: ReactiveController)`
* `requestUpdate()`
* `updateComplete: Promise<boolean>`

This is the minimum API needed for a controller host, but you can also create controllers that are specific to HTMLElement, ReactiveElement, LitElement and require more of those APIs, or even controllers that are tied to a specific element class or other interface.

### Using other controllers

{% todo %}

- Describe composition

{% endtodo %}

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

#### Controllers without classes

Controllers are just objects that implement lifecycle callbacks. You do not have to use classes to write them. One alternative pattern is to use a factory function to return a plain object.

```ts
const myController = (host: ReactiveControllerHost) => ({

});
```

## Controllers vs Mixins

Controllers and class mixins are very similar in some ways. They both can hook into a host component's lifecycle, maintain state, and trigger updates.

Controllers enable a "has-a" relationship with a component - a host "has" controllers - while mixins enable a "is-a" relationship - a host "is" an instance of the mixins applied to it. The difference is in composition vs inheritance, which each have their own uses, advantages and disadvantages. While mixins fix a lot of the traditional problems with inheritance, composition can still be better in many cases.

Advantages of controllers:

* A host can have multiple instances of the same controller type, but usually only one of a mixin. Multiple controllers of the same type can be very useful with things like tasks, queries or state management, animations, etc.
* Controller state is easily naturally grouped with the controller instance. Mixins can sometimes add a lot of fields and methods to a class. Controllers keep their own fields and methods and the name of the controller field is assigned by the component author.
* Controllers may be easier to use in smart IDEs. The code-completion results for `this.` on a class with a mixin include all of the component's inherited members, which can be a long list. The code-completion results for `this._myController` will only include the members of the controller.

Advantages of mixins:
* Controller lifecycle methods are called before the host's work for that lifecycle. If you need fine-grained control over lifecycle timing, you may want to use a mixin.
* Mixins can easily add public API to the component

We generally recommend to write reactive controllers by default, and use mixins when you need to.

## Use Cases

### External Inputs

Reactive controllers can be used to connect external inputs, like keyboard and mouse events; resize, intersection or mutation observers; etc; to a component. The controller can provide the current value of the input to use in rendering, and request a host update when the value changes.

#### Example: MouseMoveController

This example shows how a controller can perform setup and cleanup work when its host is connected and disconnected, and request an update when an input changes:

```ts
class MouseMoveController implements ReactiveController {
    private _host: ControllerHost;
    position: {x?: number, y?: number} = {};

  constructor(host: ControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }

  _onMouseMove = ({clientX, clientY}: MouseEvent) => {
    this.position = {x: clientX, y: clientY};
    this.host.requestUpdate();
  };
}
```

```ts
class MyElement extends LitElement {
  private _mouse = new MouseMoveController(this);

  render() {
    return html`
      <div>
        Current mouse position: (${this._mouse.position.x}, ${this._mouse.position.y})
      </div>
    `;
  }
}
```

### Asynchronous Tasks

A long running task typically has some state that changes over time, and will need to notify the host when the task changes state (completes, errors, etc.)

{% todo %}

- Finish
- Link to @lit-labs/task

{% endtodo %}

### Animations

{% todo %}

- Write

{% endtodo %}

## See Also

* ReactiveElement
* LitElement/Reactive Lifecycle
* @lit-labs/task
* Controller examples in the playground
