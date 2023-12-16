---
title: Redux + Lit with Reactive Controllers
publishDate: 2023-12-14
summary: Use Reactive Controllers to integrate libraries like Redux into Lit.
thumbnail: /images/articles/redux_lit_controller
thumbnailExtension: webp
tags:
  - reactive-controllers
  - redux
eleventyNavigation:
  parent: Articles
  key: Redux + Lit with Reactive Controllers
  order: 0
author:
  - elliott-marquez
  - brian-vann
---

Lit makes it easy to create web components – reusable HTML elements with shared logic. However, different elements often have similar behaviors, and creating another element just for sharing a behavior may be excessive.

[Reactive Controllers](/docs/composition/controllers/) can help with the problem of sharing logic across components without having to create a new web component. They are similar to custom hooks in React, and in this article, we will use them to integrate the state manager Redux with Lit's rendering lifecycle for a more self-contained, composable, idiomatic Lit experience.

By the end of this article, you will learn how to use Reactive Controllers to integrate third party libraries into Lit by integrating Redux into Lit. To do this, we will create a Reactive Controller that selects part of a Redux state and updates a component whenever the state updates.

## What is a Reactive Controller?

Reactive Controllers are a programming pattern that makes it easy to share logic between components by hooking into a component’s reactive update lifecycle. They achieve this by expecting an object that exposes an interface rather than having to create a new component or subclassing like you would with a mixin.

One advantage of the Reactive Controller pattern is that it creates a **with** relationship rather than an **is** relationship. For example, a component that uses a Reactive Controller that incorporates Redux logic is a **component with Redux selector abilities**, whereas a mixin that does the same would mean that the **component is a Redux selector component**. This type of composability results in code that is more portable, self-contained, and easier to refactor. This is because components that inherit via subclassing are more closely coupled with the logic they inherit.

<img
    src="/images/articles/redux-reactive-controllers/mixins-vs-controllers.webp"
    loading="lazy"
    title="Mixin Composition vs Reactive Controller Composition"
    alt="two rectangle wire diagrams. The left is labeled 'Mixin composition' the right 'Reactive Controller Composition'. There is a key that says blue lines are instance properties and green lines are class / superclasses. The mixin composition is a green rectangle labeled 'SideDrawerElement' with a co-centric green rectangle inside of it labeled 'AsyncTaskElement()`, with another co-centric green rectangle labeled 'ReduxSelectorElement()', with a final co-centric green rectangle labeled 'LitElement'. The Reactive controller diagram is a green rectable labeled 'SideDrawerElement' with three rectangles inside of it. They are: a blue dashed rectangle labeled 'ReduxSelectorController' and another one labeled 'AsyncTaskController'. The third rectangle is a green rectangle labeled 'LitElement'.">

Reactive Controllers are just an interface – a pattern, which makes them easier to use with other component systems without committing to a specific architecture. This makes it possible to create Reactive Controller adapters that work with other frameworks and libraries, such as [React](https://www.npmjs.com/package/@lit/react#usecontroller), Vue, Angular, and Svelte.

## What is Redux?

[Redux](https://redux.js.org/) is a mature library that introduces patterns to manage state across a JavaScript application. Redux currently does not have much new adoption and is not endorsed by the Lit team as a solution for all state management needs. Despite this, we will be using Redux as an example for creating a Reactive Controller, because the patterns used in integrating Redux into Lit with a Reactive Controller may be used to integrate for other popular libraries.

There are generally three concepts that Redux introduces:

1. Stores
2. Actions
3. Reducers

Stores are essentially stores of your current state. Actions are actions you would like to perform on the state, and reducers take actions and apply them to the current state to return a new state. Here is a diagram derived from the [official Redux documentation](https://redux.js.org/) that depicts the interaction pattern between these concepts:

<img
    srcset="/images/articles/redux-reactive-controllers/redux-cycle.webp 1x, /images/articles/redux-reactive-controllers/redux-cycle-2x.webp 2x"
    src="/images/articles/redux-reactive-controllers/redux-cycle.webp"
    loading="lazy"
    title="Redux lifecycle with Reactive Controllers"
    alt="A vector box diagram of the Redux cycle that is split into blue-toned, green-toned, and orange-toned boxes and arrows. At the bottom is a blue box that says UI. There is a blue arrow with the blue label 'event'. That points to a blue box called 'Event Handler'. At the top boundary of the Event Handler box is an orange box labeled 'Action Dispatcher'. From this orange box is an orange arrow labeled 'Action' pointing inside another orange box labeled Store. The orage Store box has a nested green box inside of it labeled Reducer which has 3, nested, little, green squares each labeled R. On the bottom edge of the orange Store box is a red box that says 'State'. The Orange Action arrow that was pointing inside the Orange Store box is pointing to the top of a green Reducer box. Out of the bottom of the green reducer box is another orange arrow pointing to the red 'State' box, and this arrow is labeled 'Updated State'. Out of the red State box are two orange arrows. The first orange arrow is inside the orange Store box pointing back to the top of the green reducer box and is labeled 'Old State'. The other orange arrow pointing out of the 'State' box turns into a blue arrow and is pointing to the original blue 'UI' box. The orange part of this arrow is labeled 'Subscription' in orange, and the blue part of the arrow is labeled 'Reactive Controller' in blue.">

1. The UI has an interaction that triggers an event handler
2. The event handler dispatches an Action to the store
3. A reducer takes the current state and the action and computes the new state
4. The reducer updates the state in the store
5. The UI is updated with the newest state with a state subscription and, in our case, a Reactive Controller

Lit would cover the UI (blue) section of this diagram – rendering and event handling. Redux would handle the orange, green, and red parts of this diagram. The example in this article is to create a Reactive controller that handles the interaction between the updated state and the UI by hooking into both Lit’s reactive update lifecycle and Redux’s state updates.

## The Reactive Controller Interface

The Reactive Controller package has two interfaces: one for the controller, `ReactiveController`, and one for the host that it is hooking into, `ReactiveControllerHost`.

### ReactiveController

The `ReactiveController` interface exposes four methods:

- [`hostConnected()`](/docs/api/controllers/#ReactiveController.hostConnected)
- [`hostDisconnected()`](/docs/api/controllers/#ReactiveController.hostDisconnected)
- [`hostUpdate()`](/docs/api/controllers/#ReactiveController.hostUpdate)
- [`hostUpdated()`](/docs/api/controllers/#ReactiveController.hostUpdated)

In Lit `hostConnected()` is called when the host component is placed in the DOM or if the element is already placed in the DOM and the Reactive Controller was just attached. This is a good place to do initialization work when the host component is ready to be used such as adding event listeners.

Similarly `hostDisconnected()` is called when the element is removed from the DOM. This is a good place to do some cleanup work such as removing event listeners.

`hostUpdate()` is called before the element is about to render or re-render. This is a good place to synchronize or compute state before rendering.

`hostUpdated()` is called after an element has just rendered or re-rendered. This is a good place to synchronize or compute a state that is reliant on rendered DOM. It is often discouraged to request an update to the host in this part of the lifecycle unless absolutely necessary as it may cause an unnecessary re-render of the component just after it has already rendered. Request host updates in `hostUpdated()` only when `hostUpdate()` cannot be utilized.

### ReactiveControllerHost

Reactive Controllers typically have access to an instance of an object that implements the `ReactiveControllerHost` interface, which is often passed to them upon initialization. This allows the Reactive Controller to attach itself to the host and request that it update and re-render.

The `ReactiveControllerHost` interface exposes three methods and one property:

- [`addController(controller: ReactiveController)`](/docs/api/ReactiveElement/#ReactiveElement.addController)
- [`removeController(controller: ReactiveController)`](/docs/api/ReactiveElement/#ReactiveElement.removeController)
- [`requestUpdate()`](/docs/api/ReactiveElement/#ReactiveElement.requestUpdate)
- [`updateComplete: Promise<boolean>`](/docs/api/ReactiveElement/#ReactiveElement.updateComplete)

The `addController()` method takes in the controller that you want to hook into the host’s lifecycle.

{% aside "info" "no-header" %}

If the host is already attached to the DOM or rendered onto the page, then `hostConnected()` will be called after attaching the Reactive Controller via `addController()`.

{% endaside %}

A common pattern in Lit is to attach the current instance of the controller to the host in the `constructor()` of the ReactiveController. For example:

```ts
export class MyController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost, options: MyOptions) {
    this.host = host;
    this.host.addController(this);
  }
}
```

The `removeController()` method is used less frequently than the other callbacks. It is useful when you do not want the controller to update with the host, such as: the host updates too often, the `hostUpdate[d]()` methods have slow or expensive logic, or you do not need the controller to run its updates while the component has been removed from the document.

The `requestUpdate()` method is used to request the host component to re-run its update lifecycle and re-render. This is often called when the controller has a value that updates and should be reflected in the DOM. For example, the `@lit/task` package’s `Task` controller will do asynchronous work like fetching data or asynchronous rendering, and it calls the host’s `requestUpdate()` method to reflect that the state of the task has changed to pending, in progress, completed, or error which should be rendered in the component.

The read-only `updateComplete` property is often used in conjunction with `requestUpdate()` method. A `ReactiveControllerHost`’s update lifecycle is assumed to be asynchronous, so the `updateComplete` property is a promise that resolves when the host’s update lifecycle has completed. This is useful for controllers that need to update the DOM and then read from it. For example, imagine a controller that resizes a DOM element and needs to then read its new dimensions. This controller would update a property, call `requestUpdate()`, await `host.updateComplete`, and then read the DOM.

## Redux Patterns

Redux has a bit of verbosity associated with it in order to enforce the Redux state management patterns. In this article we will be making a simple component that renders circles and squares, renders how many of them exist, and can increment or decrement the amount of circles and squares. This component will have its state managed by Redux.

<img
    src="/images/articles/redux-reactive-controllers/application-sans-labels.webp"
    loading="lazy"
    width="550px"
    title="Sketch of the redux application"
    alt="A vector box diagram of the entire redux application. There are 3 sections. The first is the shape-dials component – it has 3 rows. The first row is a minus button, the label 'squares', followed by a plus button. The second row is a minus button, the label 'circles', followed by a plus button. The final row is a long 'reset' button. The next section to the right of the shape-dials section the '<shape-count>' component. It is a black box with 3 rows of text. The first row is '2 circles'. The second row is '2 squares', and the third row is '4 total'. Below the shape-dials and shape-count components is a long rectangle which is the '<shape-list>' section. This is a long, horizonal, black rectangle and inside of it is a red square followed by a blue circle, blue circle, and another red square.">

### Initial State

We need to define an initial state, so in a <code>store.<ts-js></ts-js></code> file we will give the initial state the following shape:

```ts
type Shape = 'square' | 'circle';
interface State {
  circles: number;
  squares: number;
  shapeList: Shape[];
}
const initialState: State = {
  squares: 0,
  circles: 0,
  shapeList: []
};
```

### Reducers

Next we will write the reducer which will define which types of actions this store will be able to accept as well as determine how to update the state. Our reducer will have the following actions:

- `increment_circles`
- `increment_squares`
- `decrement_circles`
- `decrement_squares`
- `reset`

Here is how the reducer could look like in the <code>store.<ts-js></ts-js></code> file:

```ts
import type { Reducer, Action } from '@reduxjs/toolkit';
...

const CIRCLE = 'circle';
const SQUARE = 'square';
const INCREMENT_CIRCLES = 'increment_circles';
const DECREMENT_CIRCLES = 'decrement_circles';
const INCREMENT_SQUARES = 'increment_squares';
const DECREMENT_SQUARES = 'decrement_squares';
const RESET = 'reset';

/**
 * The reducer for the shape store.
 */
const countStoreReducer: Reducer<State, Action> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case RESET:
      return {circles: 0, squares: 0, shapeList: []};
    case INCREMENT_CIRCLES:
      return {
        ...state,
        circles: state.circles + 1,
        shapeList:  [...state.shapeList, CIRCLE],
      };
    case DECREMENT_CIRCLES:
      return {
        ...state,
        circles: Math.max(state.circles - 1, 0),
        shapeList: removeShape(state, CIRCLE),
      };
    case INCREMENT_SQUARES:
      return {
        ...state,
        squares: state.squares + 1,
        shapeList:  [...state.shapeList, SQUARE],
      };
    case DECREMENT_SQUARES:
      return {
        ...state,
        squares: Math.max(state.squares - 1, 0),
        shapeList: removeShape(state, SQUARE),
      };
    default:
      return state;
  }
}

/**
 * A helper function that removes the last index of a
 * given shape from the current state's `shapeList`.
 */
const removeShape = (state: State, shape: Shape): Shape[] => {
  const shapes = [...state.shapeList];
  const index = shapes.lastIndexOf(shape);
  if (index > -1) {
    shapes.splice(index, 1);
  }

  return shapes;
};
```

### Store

Next we will create the store and initialize it with the `RESET` action:

```ts
import { configureStore } from '@reduxjs/toolkit';

// The countStoreReducer is the reducer we made in the last section
const store = configureStore({reducer: countStoreReducer});
store.dispatch({type: RESET});
```

We have not successfully created a Redux store that has an initial state and can update its state using the reducer.

<img
    srcset="/images/articles/redux-reactive-controllers/redux-completed.webp 1x, /images/articles/redux-reactive-controllers/redux-completed-2x.webp 2x"
    src="/images/articles/redux-reactive-controllers/redux-completed.webp"
    loading="lazy"
    width="826px"
    title="Redux lifecycle with Reactive Controllers"
    alt="A vector box diagram of the Redux cycle that is split into blue-toned, green-toned, and orange-toned boxes and arrows. At the bottom is a blue box that says UI. There is a blue arrow with the blue label 'event'. That points to a blue box called 'Event Handler'. At the top boundary of the Event Handler box is an orange box labeled 'Action Dispatcher'. From this orange box is an orange arrow labeled 'Action' pointing inside another orange box labeled Store. The orage Store box has a nested green box inside of it labeled Reducer which has 3, nested, little, green squares each labeled R. On the bottom edge of the orange Store box is a red box that says 'State'. The Orange Action arrow that was pointing inside the Orange Store box is pointing to the top of a green Reducer box. Out of the bottom of the green reducer box is another orange arrow pointing to the red 'State' box, and this arrow is labeled 'Updated State'. Out of the red State box are two orange arrows. The first orange arrow is inside the orange Store box pointing back to the top of the green reducer box and is labeled 'Old State'. The other orange arrow pointing out of the 'State' box turns into a blue arrow and is pointing to the original blue 'UI' box. The orange part of this arrow is labeled 'Subscription' in orange, and the blue part of the arrow is labeled 'Reactive Controller' in blue. The store is enclosed in a dashed green line that has a key that labels that section as 'Completed'">

### Actions

As demonstrated when initializing the state of the store, we can dispatch actions to the store using the [`store.dispatch(action)`](https://redux.js.org/api/store#dispatchaction) method. Let us create a `shape-dials` element that has circle and square increment buttons as well as a reset button. And upon click, will dispatch the appropriate actions:

<img
    src="/images/articles/redux-reactive-controllers/shape-dials.webp"
    width="299px"
    loading="lazy"
    title="Sketch of the shape-dials component"
    alt="A vector box diagram of the shape-dials component. There are 3 rows. The first row is a minus button, the label 'squares', followed by a plus button. The second row is a minus button, the label 'circles', followed by a plus button. The final row is a long 'reset' button.">

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  DECREMENT_SQUARES,
  INCREMENT_SQUARES,
  DECREMENT_CIRCLES,
  INCREMENT_CIRCLES,
  RESET,
} from './store.js';


@customElement('shape-dials')
export class ShapeDials extends LitElement {
  render() {
    return html`
      <div id="circles">
        <button @click=${this.decrementCircles}>-</button>
        circles
        <button @click=${this.incrementCircles}>+</button>
      </div>

      <div id="squares">
        <button @click=${this.decrementSquares}>-</button>
        squares
        <button @click=${this.incrementSquares}>+</button>
      </div>

      <button id="reset" @click=${this.reset}>reset</button>
    `;
  }

  /*
    Event listener callbacks broadcast actions using a store's
    own dispatch method.
  */
  private decrementCircles() {
    store.dispatch({type: DECREMENT_CIRCLES});
  }

  private incrementCircles() {
    store.dispatch({type: INCREMENT_CIRCLES});
  }

  private decrementSquares() {
    store.dispatch({type: DECREMENT_SQUARES});
  }

  private incrementSquares() {
    store.dispatch({type: INCREMENT_SQUARES});
  }

  private reset() {
     store.dispatch({type: RESET});
  }
}
```

## Writing the SelectorController Reactive Controller

Now we have our state managed by Redux and are dispatching actions to the store. The store is updating its state using the reducer.

<img
    srcset="/images/articles/redux-reactive-controllers/ui-completed.webp 1x, /images/articles/redux-reactive-controllers/ui-completed-2x.webp 2x"
    src="/images/articles/redux-reactive-controllers/ui-completed.webp"
    loading="lazy"
    width="826px"
    title="Redux lifecycle with Reactive Controllers"
    alt="A vector box diagram of the Redux cycle that is split into blue-toned, green-toned, and orange-toned boxes and arrows. At the bottom is a blue box that says UI. There is a blue arrow with the blue label 'event'. That points to a blue box called 'Event Handler'. At the top boundary of the Event Handler box is an orange box labeled 'Action Dispatcher'. From this orange box is an orange arrow labeled 'Action' pointing inside another orange box labeled Store. The orage Store box has a nested green box inside of it labeled Reducer which has 3, nested, little, green squares each labeled R. On the bottom edge of the orange Store box is a red box that says 'State'. The Orange Action arrow that was pointing inside the Orange Store box is pointing to the top of a green Reducer box. Out of the bottom of the green reducer box is another orange arrow pointing to the red 'State' box, and this arrow is labeled 'Updated State'. Out of the red State box are two orange arrows. The first orange arrow is inside the orange Store box pointing back to the top of the green reducer box and is labeled 'Old State'. The other orange arrow pointing out of the 'State' box turns into a blue arrow and is pointing to the original blue 'UI' box. The orange part of this arrow is labeled 'Subscription' in orange, and the blue part of the arrow is labeled 'Reactive Controller' in blue. Everything but the orange-blue arrow is enclosed in a dashed green line that has a key that labels that section as 'Completed'">

Next we need to give some elements the ability to connect and subscribe to changes to the store and update the UI. On top of that we will write a “Selector” which will select a specific datum from the overall state, and if that value changes, we will tell the Reactive Controller host to re-render.

### Attaching the Controller and Accepting options

First we will write the definition of the `SelectorController` class and attach it to the host element so that the Reactive Controller can hook into the host’s reactive update lifecycle:

```ts
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export class SelectorController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }
}
```

Next, let's accept the following options: the Redux store in which we would like to subscribe to, as well as the Selector we would like to use to select what data we would like to render from the store:

```ts
import type { Store, Action as RAction } from '@reduxjs/toolkit';
...

export type Selector<State, Result> = (state: State) => Result;

export class SelectorController<
    State,
    Action extends RAction,
    Result = unknown
> implements ReactiveController {
  host: ReactiveControllerHost;
  store: Store<State, Action>;
  selector: Selector<State, Result>;

  constructor(
    host: ReactiveControllerHost,
    store: Store<State, Action>,
    selector: Selector<State, Result>,
  ) {
    this.host = host;
    host.addController(this);

    this.store = store;
    this.selector = selector;
  }
}
```

Now let’s initialize the initially selected value so that the user can access the state’s initial value with `selectorController.selected` using the user's selector:

```ts
...
export class SelectorController<
    State,
    Action extends RAction,
    Result = unknown
> implements ReactiveController {
  ...
  selected: Result;

  constructor(
    host: ReactiveControllerHost,
    store: Store<State, Action>,
    selector: Selector<State, Result>,
  ) {
    ...
    this.selected = selector(store.getState());
  }
}
```

### Updating the Component on Store Update

We now have a controller that initializes to the initial state of the store, next let’s update `this.selected` when the state updates and then tell the host element to re-render when we have detected a change in the selected value.

Redux stores have a [`Store.subscribe(listener)`](https://redux.js.org/api/store#subscribelistener) method which will call a given callback whenever the state of the store updates. Let's hook into this, update `this.selected`, and tell the host to update when the component is connected to the DOM:

```ts
...
export class SelectorController<
    State,
    Action extends RAction,
    Result = unknown
> implements ReactiveController {
  ...

  hostConnected() {
    this.store.subscribe(() => {
      const selected = this.selector(this.store.getState());
      this.selected = selected;
      this.host.requestUpdate();
    });
  }
}
```

Great! Now the controller will update its value and tell the host element to update whenever the state changes. A problem we may encounter here is that we will call `host.requestUpdate()` whenever *any* state changes and not specifically when our selected value changes. In this case, we should do an equality check and let the user decide if they would like to implement their own equality check:

```ts
...
export type EqualityCheck = (a: unknown, b: unknown) => boolean;
const tripleEquals: EqualityCheck = (a, b) => a === b;

export class SelectorController<
    State,
    Action extends RAction,
    Result = unknown
> implements ReactiveController {
  ...
  equalityCheck : EqualityCheck;

  constructor(
    host: ReactiveControllerHost,
    store: Store<State, Action>,
    selector: Selector<State, Result>,
    equalityCheck = tripleEquals
  ) {
    ...
    this.equalityCheck = equalityCheck;
  }

  hostConnected() {
    this.store.subscribe(() => {
      const selected = this.selector(this.store.getState());
      if (!this.equalityCheck(this.selected, selected)) {
        this.selected = selected;
        this.host.requestUpdate();
      }
    });
  }
}
```

By first comparing the previous state to the current state, we can avoid re-rendering components that don't need to be re-rendered which can improve performance. Nice!

In conclusion, we need to improve our component so that it does not re-render when the component is disconnected from the page and the store’s state changes. Redux’s `Store.subscribe()` method returns an `unsubscribe()` function. Let’s keep track of this and unsubscribe from the store’s changes when the component disconnects.

```ts
...
export class SelectorController<
    State,
    Action extends RAction,
    Result = unknown
> implements ReactiveController {
  ...
  unsubscribe: () => void;
  ...

  hostConnected() {
    this.unsubscribe = this.store.subscribe(() => {
      ...
    });
  }

  hostDisconnected() {
    this.unsubscribe();
  }
}
```

We now have a Redux `SelectorController` Reactive Controller that listens to a Redux store for state changes, selects a value from the state, and updates the host element whenever that state value changes!

## Using the Controllers

Now that we have a functioning controller, let’s use it! Let’s create two components and update our shape dial’s controls:

1. `shape-count`
    - A component that counts the shapes and the total number of shapes
2. `shape-list`
    - A component that visualizes the shapes that we have added

And finally we will update `shape-dials` to disable the buttons when they are not applicable. The application should look something like this:

<img
    src="/images/articles/redux-reactive-controllers/application.webp"
    loading="lazy"
    width="550px"
    title="Sketch of the redux application"
    alt="A vector box diagram of the entire redux application. There are 3 sections. The first is the shape-dials component – it has 3 rows. The first row is a minus button, the label 'squares', followed by a plus button. The second row is a minus button, the label 'circles', followed by a plus button. The final row is a long 'reset' button. This component is surrounded by a red dashed-square labeled '<shape-dials>'. The next section to the right of the shape-dials section is labeled by a red label that says '<shape-count>'. It is a black box with 3 rows of text. The first row is '2 circles'. The second row is '2 squares', and the third row is '4 total'. Below the shape-dials and shape-count components is a long rectangle labeled '<shape-list>'. This is a long, horizonal, black rectangle and inside of it is a red square followed by a blue circle, blue circle, and another red square.">

### shape-count

`shape-count` should be a component that only subscribes and reads from the store. Let us create a custom element and render the table:

```ts
import { LitElement, html} from 'lit';
import { customElement} from 'lit/decorators.js';

@customElement('shape-count')
export class ShapeCount extends LitElement {
  render() {
    return html`
      <table>
        <tr>
          <td>${0}</td>
          <td>circles</td>
        </tr>
        <tr>
          <td>${0}</td>
          <td>squares</td>
        </tr>
        <tr>
          <td>${0}</td>
          <td>total</td>
        </tr>
      </table>
    `;
  }
}
```

Next we want to render actual counts rather than just `0`. In this case we will need all values from the state:

- `state.circles`
- `state.squares`
- `state.shapeList`

To achieve this, we will need a broad Redux selector that selects the entire state:

```ts
...
import { SelectorController } from './selector-controller.js';
import { store } from './store.js';

@customElement('shape-count')
export class ShapeCount extends LitElement {
  private sc = new SelectorController(this, store, (state) => state);

  render() {
    const {circles, squares, shapeList} = this.sc.selected;

    return html`
      <table>
        <tr>
          <td>${circles}</td>
          <td>circles</td>
        </tr>
        <tr>
          <td>${squares}</td>
          <td>squares</td>
        </tr>
        <tr>
          <td>${shapeList.length}</td>
          <td>total</td>
        </tr>
      </table>
    `;
  }
}
```

Pressing the buttons in `shape-dials` should now update the count!

To accomplish this, we initialized the `SelectorController` with the shared Redux store and rendered the entire state.

### shape-list

`shape-list` should be a component that only subscribes and reads the `state.shapeList` state from the store. Let's create a custom element with boilerplate, and render an array of `<div>`s with classes set to the shape name. Our pre-provided CSS styles will render the squares and circles based on the class name.

```ts
import { customElement } from 'lit/decorators.js';
import { LitElement, html} from 'lit';

@customElement('shape-list')
export class ShapeList extends LitElement {
  render() {
    const shapeList = [];

    return shapeList.map(
        shape => html`<div class="${shape}"></div>`
    );
  }
}
```

Next, let’s initialize our `SelectorController` to hook into Redux and render the `shapeList`:

```ts
...
import { SelectorController } from './selector-controller.js';
import { store } from './store.js';

@customElement('shape-list')
export class ShapeList extends LitElement {
  private sc = new SelectorController(this, store, (state) => state.shapeList);

  render() {
    const shapeList = this.sc.selected;
    ...
  }
}
```

Finally, let’s give it an equality check to only update the render when the values have changed.

```ts
...

@customElement('shape-list')
export class ShapeList extends LitElement {
  private sc = new SelectorController(
    this,
    store,
    (state) => state.shapeList,
    (oldVal, newVal) => {
      if (oldVal.length !== newVal.length) {
        return false;
      }

      return !oldVal.some((old, i) => {
        return old !== newVal[i];
      });
    }
  );

  ...
}
```

The `shape-list` component should now be responsive to changes in the Redux store!

We were able to accomplish this by initializing the `SelectorController` with the shared Redux store. We then selected only the `shapeList` from the state and updated the host element only when the arrays were truly not equal.

### Preventing invalid inputs in shape-dials

To prevent invalid inputs, we will use our `SelectorController` to disable the buttons in the `shape-dials` component. For example, we want to disable the decrement buttons when the respective shape count is 0, and we want to disable the reset button when the length of the `shapeList` is 0.

We will be using the entire state object again, so the selector will be broad. Let’s add the SelectorController to our `shape-dials` component.

```ts
...
import {
  ...
  store,
} from './store.js';
import { SelectorController } from './selector-controller.js';

@customElement('shape-dials')
export class ShapeDials extends LitElement {
  private sc = new SelectorController(this, store, (state) => state);

  render() {
    const {circles, squares, shapeList} = this.sc.selected;

    return html`
      <div id="circles">
        <button
          .disabled=${circles === 0}
          @click=${this.decrementCircles}>-</button>
        circles
        <button @click=${this.incrementCircles}>+</button>
      </div>

      <div id="squares">
        <button
          .disabled=${squares === 0}
          @click=${this.decrementSquares}>-</button>
        squares
        <button @click=${this.incrementSquares}>+</button>
      </div>

      <button
        id="reset"
        .disabled=${shapeList.length === 0}
        @click=${this.reset}>reset</button>
    `;
  }

  ...
}
```

We should now have the decrement and reset buttons disabled upon invalid input, and a fully functional Lit-Redux application!

## Integrating Other Libraries

`SelectorController` is a simple integration. It only handles selectors, but it could easily abstract more of Redux into the controller, such as automatically dispatching actions when a property changes. Reactive Controllers give you the freedom to abstract as little or as much of a library as you want.

### State Managers

Reactive Controllers are useful for integrating state managers because it is common to want to update the view whenever the state changes or update the state manager when the UI changes.

A great example of using Reactive Controllers for state management is the Apollo Element’s [Apollo Query Reactive Controllers](https://apolloelements.dev/api/core/controllers/query/) for Apollo GraphQL. Reactive Controllers can fit nicely in other similar projects like [MobX](https://mobx.js.org/README.html), [RxJS](https://rxjs.dev/), or [Zustand](https://github.com/pmndrs/zustand#using-zustand-without-react).

### Data Fetching and Rendering Libraries

Reactive Controllers are also useful for integrating libraries that fetch data and need to synchronize with Lit’s rendering or update lifecycle.

For example, the [@lit/task](/docs/data/task/) library can perform simple async logic and easily render results and status. Reactive Controllers can fit nicely in other similar projects such as [Axios](https://axios-http.com/), [TanStack Query](https://tanstack.com/query/latest), or the experimental [@lit-labs/router](https://www.npmjs.com/package/@lit-labs/router).

### Your Own Bespoke Behavior

Reactive Controllers are generally a good way to share logic across components and we cannot cover every possible use case here. For example [Material Design’s Material Components](https://material-web.dev) have written their own bespoke controllers such as the [SurfacePositionController](https://github.com/material-components/material-web/blob/v1.1.1/menu/internal/controllers/surfacePositionController.ts) which can position a popup surface next to an anchor or [TypeaheadController](https://github.com/material-components/material-web/blob/v1.1.1/menu/internal/controllers/typeaheadController.ts) which can automatically select an item from a list just by typing the first few letters of the item like an autocomplete.

Reactive Controllers are flexible, focused, and a great way to integrate libraries into your Lit project or any framework of your choice.