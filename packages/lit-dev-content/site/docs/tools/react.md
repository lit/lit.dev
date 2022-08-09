---
title: React
eleventyNavigation:
  key: React
  parent: Tools
  order: 9
versionLinks:
  v1: tools/build/#react
---

# @lit/react

React integration for Web Components and Reactive Controllers.

## Overview

The purpose of this package is to provide the missing support that React doesn't already provide.

While React can render Web Components, it [cannot](https://custom-elements-everywhere.com/libraries/react/results/results.html)
easily pass React props to custom element properties or event listeners. There is substantial support for web components
in the latest [experimental](https://www.npmjs.com/package/react) build of React. However, inferring an event _type_ is still difficult.

## Installation

From inside your project folder, run:

```bash
$ npm install @lit/react
```

## `createComponent`

The utility function `createComponent` returns a [forwarded ref](https://reactjs.org/docs/forwarding-refs.html)
containing a custom element class. The wrapper passes the properties of a custom element as React `props` listens
for events dispatched by the custom element.

### How it works

For properties, the wrapper interrogates the web component class to discover available properties.
Then React `props` passed that match property names are
set on the custom element as properties and not attributes.

For events, `createComponent` accepts a map to match React event prop names
with events fired by the custom element. For example passing `{onfoo: 'foo'}`
means a function passed via a `prop` named `onfoo` will be called when the
custom element fires the foo event with the event as an argument.

### Usage

Import `React`, a custom element class, and `createComponent`.

```js
import * as React from 'react';
import {createComponent} from '@lit-labs/react';
import {MyElement} from './my-element.js';

export const MyElementComponent = createComponent(
  React,
  'my-element',
  MyElement,
  {
    onactivate: 'activate',
    onchange: 'change',
  }
);
```

After defining the React component, use it like any other React component.

```jsx
<MyElementComponent
  active={isActive}
  onactivate={(e) => (isActive = e.active)}
/>
```

#### Typescript

Event callback types can be type casted using `EventName`. The
type cast helps `createComponent` correlate a callback type to a property name in
the event property map.

Non-casted event names will fallback to an event type of `Event`.

```ts
import type {EventName} from '@lit-labs/react';

import * as React from 'react';
import {createComponent} from '@lit-labs/react';
import {MyElement} from './my-element.js';

export const MyElementComponent = createComponent(
  React,
  'my-element',
  MyElement,
  {
    onClick: 'pointerdown' as EventName<PointerEvent>,
    onChange: 'input',
  }
);
```

Event callbacks match their type cast. In the example below, a
`PointerEvent` is expected in the `onClick` callback.

```tsx
<MyElementComponent
  onClick={(e: PointerEvent) => {
    console.log('DOM PointerEvent called!');
  }}
  onChange={(e: Event) => {
    console.log(e);
  }}
/>
```

NOTE: This type casting is not associated to any component property. Be
careful to use the corresponding type dispatched or bubbled from the
webcomponent. Incorrect types might result in additional properties, missing
properties, or properties of the wrong type.

## `useController`

Reactive Controllers allow developers to hook a component's lifecycle bundling
state and behavior into a related feature. They are similar to React
hooks in the use cases and capabilities, but are plain JavaScript objects
instead of functions with hidden state.

`useController` is a React hook that create and stores a Reactive Controller
and drives its lifecycle using React hooks like `useState` and
`useLayoutEffect`.

### How it works

`useController` uses `useState` to create and store an instance of a controller and a `ReactControllerHost`. It then calls the controller's lifecycle from the hook body and `useLayoutEffect` callbacks, emulating the `ReactiveElement` lifecycle as closely as possible.

`ReactControllerHost` implements `addController` ensuring controller composition works and nested controller lifecycles are called correctly. `ReactControllerHost` also implements `requestUpdate` by calling a `useState` setter, so that a controller with new renderable state can cause its host component to re-render.

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

### Usage

```jsx
import * as React from 'react';
import {useController} from '@lit-labs/react/use-controller.js';
import {MouseController} from '@example/mouse-controller';

// Write a React hook function:
const useMouse = () => {
  // Use useController to create and store a controller instance:
  const controller = useController(React, (host) => new MouseController(host));
  // return the controller: return controller;
  // or return a custom object for a more React-idiomatic API:
  return controller.position;
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

## Contributing

Please see [CONTRIBUTING.md](../../../CONTRIBUTING.md).