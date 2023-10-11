---
title: React
eleventyNavigation:
  key: React
  parent: Frameworks
  order: 1
versionLinks:
  v2: frameworks/react/
---

The [@lit/react](https://github.com/lit/lit/tree/main/packages/react) package provides utilities to create React wrapper components for web components, and custom hooks from [reactive controllers](../../composition/controllers/).

The React component wrapper enables setting properties on custom elements (instead of just attributes), mapping DOM events to React-style callbacks, and enables correct type-checking in JSX by TypeScript.

The wrappers are targeted at two different audiences:
- Users of web components can wrap components and controllers for their own use in their own React projects.
- Vendors of components can publish React wrappers so that their React users have idiomatic versions of their components.

### Why are wrappers needed?

React can already render web components, since custom elements are just HTML elements and React knows how to render HTML. But React makes some assumptions about HTML elements that don't always hold for custom elements, and it treats lower-case tag names differently from upper-case component names in ways that can make custom elements harder than necessary to use.

For instance, React assumes that all JSX properties map to HTML element attributes, and provides no way to set properties. This makes it difficult to pass complex data (like objects, arrays, or functions) to web components. React also assumes that all DOM events have corresponding "event properties" (`onclick`, `onmousemove`, etc), and uses those instead of calling `addEventListener()`. This means that to properly use more complex web components you often have to use `ref()` and imperative code. (For more information on the limitations of React's web component integration, see [Custom Elements Everywhere](https://custom-elements-everywhere.com/libraries/react/results/results.html).)

React is working on fixes to these issues, but in the meantime, our wrappers take care of setting properties and listening to events for you.

The `@lit/react` package provides two main exports:

-   `createComponent()` creates a React component that _wraps_ an existing web component. The wrapper allows you to set props on the component and add event listeners to the component like you would any other React component.

-   `useController()` lets you use a Lit reactive controller as a React hook.  

## createComponent

The `createComponent()` function makes a React component wrapper for a custom element class. The wrapper correctly passes React `props` to properties accepted by the custom element and listens for events dispatched by the custom element.

### Usage

Import `React`, a custom element class, and `createComponent`.

```js
import React from 'react';
import {createComponent} from '@lit/react';
import {MyElement} from './my-element.js';

export const MyElementComponent = createComponent({
  tagName: 'my-element',
  elementClass: MyElement,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});
```

After defining the React component, you can use it just as you would any other React component.

```jsx
<MyElementComponent
  active={isActive}
  onactivate={(e) => setIsActive(e.active)}
  onchange={handleChange}
/>
```

{% aside "positive" "no-header" %}

See it in action in the [React playground examples](/playground/#sample=examples/react-basics).

{% endaside %}

#### Options

`createComponent` takes an options object with the following properties:

- `tagName`: The custom element's tag name.
- `elementClass`: The custom element class.
- `react`: The imported `React` object. This is used to create the wrapper component with the user supplied `React`. This can also be an import of `preact-compat`.
- `events`: An object that maps an event handler prop to an event name fired by the custom element.

#### Using slots

Children of component created with `createComponent()` will render to the default slot of the custom element.

```jsx
<MyElementComponent>
  <p>This will render in the default slot.</p>
</MyElementComponent>
```

To render the child to a specific named slot, the standard `slot` attribute can be added.

```jsx
<MyElementComponent>
  <p slot="foo">This will render in the slot named "foo".</p>
</MyElementComponent>
```

Since React components are not themselves HTML elements, they usually cannot directly have a `slot` attribute. To render into a named slot, the component will need to be wrapped with a container element that has a `slot` attribute. If a wrapper element interferes with styling, like for grid and flexbox layouts, giving it a `display: contents;` style ([See MDN for details](https://developer.mozilla.org/en-US/docs/Web/CSS/display#box)) will remove the container from rendering, and only render its children.

```jsx
<MyElementComponent>
  <div slot="foo" style="display: contents;">
    <ReactComponent />
  </div>
</MyElementComponent>
```

{% aside "positive" "no-header" %}

Try it out in the [React slots playground example](/playground/#sample=examples/react-slots).

{% endaside %}

#### Events

The `events` option takes an object that maps React prop names to event names. When a component user passes a callback prop with one of the event prop names, the wrapper will add it as an event handler for the corresponding event.

While the the React prop name can be whatever you want, the recommended convention is to add `on` in front of the event name. This matches how React is planning to implement event support for custom elements. You should also make sure this prop name does not collide with any existing properties on the element.

In TypeScript, the event type can be specified by casting the event name to the `EventName` utility type. This is a good practice to do so that React users will get the most accurate types for their event callbacks.

The `EventName` type is a string that takes an event interface as a type parameter. Here we cast the `'my-event'` name to an `EventName<MyEvent>` to provide the right event type:

```ts

import React from 'react';
import {createComponent} from '@lit/react';
import {MyElement, type EventName} from './my-element.js';

export const MyElementComponent = createComponent({
  tagName: 'my-element',
  elementClass: MyElement,
  react: React,
  events: {
    'onmy-event': 'my-event' as EventName<MyEvent>,
  },
});
```

Casting the event name to `EventName<MyEvent>` causes the React component to have an `onMyEvent` callback prop that accepts a `MyEvent` parameter instead of a plain `Event`:

```tsx
<MyElementComponent
  onmy-event={(e: MyEvent) => {
    console.log(e.myEventData);
  }}
/>
```

### How it works

During a render, the wrapper receives props from React and based on the options and the custom element class, changes the behavior of some of the props:

* If a prop name is a property on the custom element, as determined with an `in` check, the wrapper sets that property on the element to the prop value
* If a prop name is an event name passed to the `events` option, the prop value is passed to `addEventListener()` with the name of the event.
* Otherwise the prop is passed to React's `createElement()` to be rendered as an attribute.

Both properties and events are added in `componentDidMount()` and `componentDidUpdate()` callbacks, because the element must have already been instantiated by React in order to access it.

For events, `createComponent()` accepts a mapping of React event prop names to events fired by the custom element. For example passing `{onfoo: 'foo'}` means a function passed via a prop named `onfoo` will be called when the custom element fires the `foo` event with the event as an argument.

## useController

Reactive controllers allow developers to hook in to a component's lifecycle to bundle
together state and behavior related to a feature. They are similar to React
hooks in the user cases and capabilities, but are plain JavaScript objects
instead of functions with hidden state.

`useController()` lets you make React hooks out of reactive controllers allowing for the sharing of state and behaviors across web components and React.

### Usage

```jsx
import React from 'react';
import {useController} from '@lit/react/use-controller.js';
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

`useController()` creates a custom host object for the controller passed to it and drives the controller's lifecycle by using React hooks.

- `useState()` is used to store an instance of a controller and a `ReactControllerHost`
- The hook body and `useLayoutEffect()` callbacks emulate the `ReactiveElement` lifecycle as closely as possible.
- `ReactControllerHost` implements `addController()` so that controller composition works and nested controller lifecycles are called correctly.
- `ReactControllerHost` also implements `requestUpdate()` by calling a `useState()` setter, so that a controller can cause its host component to re-render.
