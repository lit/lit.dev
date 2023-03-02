---
title: React
eleventyNavigation:
  key: React
  parent: Framework integration
  order: 1
  labs: true
---

{% labs-disclaimer %}

The [@lit-labs/react](https://github.com/lit/lit/tree/main/packages/labs/react) package provides utilities to create React wrapper components for web components, and custom hooks from [reactive controllers](../../composition/controllers/).

The React component wrapper enables setting properties on custom elements (instead of just attributes), mapping DOM events to React-style callbacks, and enables correct type-checking in JSX by TypeScript.

The wrappers are targeted at two different audiences:
- Users of web components can wrap components and controllers for their own use in their own React projects.
- Vendors of components can publish React wrappers so that their React users have idiomatic versions of their components.

### Why are wrappers needed?

React can already render web components, since custom elements are just HTML elements and React knows how to render HTML. But React makes some assumptions about HTML elements that don't always hold for custom elements, and it treats lower-case tag names differently from upper-case component names in ways that can make custom elements harder than necessary to use.

For instance, React assumes that all JSX properties map to HTML element attributes, and provides no way to set properties. This makes it difficult to pass complex data (like objects, arrays, or functions) to web components. React also assumes that all DOM events have corresponding "event properties" (`onclick`, `onmousemove`, etc), and uses those instead of calling `addEventListener()`. This means that to properly use more complex web components you often have to use `ref()` and imperative code. (For more information on the limitations of React's web component integration, see [Custom Elements Everywhere](https://custom-elements-everywhere.com/libraries/react/results/results.html).)

React is working on fixes to these issues, but in the meantime, our wrappers take care of setting properties and listening to events for you.

The `@lit-labs/react` package provides two main exports:

-   `createComponent()` creates a React component that _wraps_ an existing web component. The wrapper allows you to set props on the component and add event listeners to the component like you would any other React component.

-   `useController()` lets you use a Lit reactive controller as a React hook.  

## createComponent

The `createComponent()` function makes a React component wrapper for a custom element class. The wrapper correctly passes React `props` to properties accepted by the custom element and listens for events dispatched by the custom element.

### Usage

Import `React`, a custom element class, and `createComponent`.

```js
import React from 'react';
import {createComponent} from '@lit-labs/react';
import {MyElement} from './my-element.js';

export const MyElementComponent = createComponent({
  tagName: 'my-element',
  elementClass: MyElement,
  react: React,
  events: {
    onActivate: 'activate',
    onChange: 'change',
  },
});
```

After defining the React component, you can use it just as you would any other React component.

```jsx
<MyElementComponent
  active={isActive}
  onActivate={(e) => setIsActive(e.active)}
  onChange={handleChange}
/>
```

#### Options

`createComponent` takes an options object with the following properties:

- `tagName`: The custom element's tag name.
- `elementClass`: The custom element class.
- `react`: The imported `React` object. This is used to create the wrapper component with the user supplied `React`. This can also be an import of `preact-compat`.
- `events`: An object that maps an event handler prop to an event name fired by the custom element.

#### Typing event handler props

The parameter type for the event handler prop can be refined by type casting the event name in the `events` options with the provided `EventName` utility type. Non-casted event names will fall back to the `Event` type.

```ts
import type {EventName} from '@lit-labs/react';

import React from 'react';
import {createComponent} from '@lit-labs/react';
import {MyElement} from './my-element.js';

export const MyElementComponent = createComponent({
  tagName: 'my-element',
  elementClass: MyElement,
  react: React,
  events: {
    onClick: 'pointerdown' as EventName<PointerEvent>,
    onChange: 'input',
  },
});
```

With the casting done above, a `PointerEvent` is expected for the parameter of the function provided to the `onClick` prop.

```tsx
<MyElementComponent
  onClick={(e: PointerEvent) => {
    // handle click
  }}
  onChange={(e: Event) => {
    // handle change
  }}
/>
```

### How it works

During a render, the wrapper receives props from React and based on the options and the custom element class, changes the behavior of some of the props:

* If a prop name is a property on the custom element, as determined with an `in` check, the wrapper sets that property on the element to the prop value
* If a prop name is an event name passed to the `events` option, the prop value is passed to `addEventListener()` with the name of the event.
* Otherwise the prop is passed to React's `createElement()` to be rendered as an attribute.

Both properties and events are added in `componentDidMount()` and `componentDidUpdate()` callbacks, because the element must have already been instantiated by React in order to access it.

For events, `createComponent()` accepts a mapping of React event prop names to events fired by the custom element. For example passing `{onFoo: 'foo'}` means a function passed via a prop named `onFoo` will be called when the custom element fires the `foo` event with the event as an argument.

## useController

Reactive controllers allow developers to hook in to a component's lifecycle to bundle
together state and behavior related to a feature. They are similar to React
hooks in the user cases and capabilities, but are plain JavaScript objects
instead of functions with hidden state.

`useController()` lets you make React hooks out of reactive controllers allowing for the sharing of state and behaviors across web components and React.

### Usage

```jsx
import React from 'react';
import {useController} from '@lit-labs/react/use-controller.js';
import {MouseController} from '@example/mouse-controller';

// Write a custom React hook function:
const useMouse = () => {
  // Use useController to create and store a controller instance:
  const controller = useController(React, (host) => new MouseController(host));
  // Return relevant data for consumption by the component:
  return controller.pos;
};

// Now use the new hook in a React component:
const Component = (props) => {
  const mousePosition = useMouse();
  return (
    <pre>
      x: {mousePosition.x}
      y: {mousePosition.y}
    </pre>
  );
};
```

See the [mouse controller example](../../composition/controllers/#example:-mousemovecontroller) in the reactive controller docs for its implementation.

### How it works

`useController()` uses `useState` to create and store an instance of a controller and a `ReactControllerHost`. It then calls the controller's lifecycle from the hook body and `useLayoutEffect` callbacks, emulating the `ReactiveElement` lifecycle as closely as possible. `ReactControllerHost` implements `addController` so that controller composition works and nested controller lifecycles are called correctly. `ReactControllerHost` also implements `requestUpdate` by calling a `useState` setter, so that a controller with new renderable state can cause its host component to re-render.

Controller timings are implemented as follows:

| Controller API   | React hook equivalent               |
| ---------------- | ----------------------------------- |
| constructor      | useState initial value              |
| hostConnected    | useState initial value              |
| hostDisconnected | useLayoutEffect cleanup, empty deps |
| hostUpdate       | hook body                           |
| hostUpdated      | useLayoutEffect                     |
| requestUpdate    | useState setter                     |
| updateComplete   | useLayoutEffect                     |
