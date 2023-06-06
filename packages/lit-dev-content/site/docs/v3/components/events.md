---
title: Events
eleventyNavigation:
  key: Events
  parent: Components
  order: 7
versionLinks:
  v1: components/events/
  v2: components/events/
---

Events are the standard way that elements communicate changes. These changes typically occur due to user interaction. For example, a button dispatches a click event when a user clicks on it; an input dispatches a change event when the user enters a value in it.

In addition to these standard events that are automatically dispatched, Lit elements can dispatch custom events. For example, a menu element might dispatch an event to indicate the selected item changed; a popup element might dispatch an event when the popup opens or closes.

Any Javascript code, including Lit elements themselves, can listen for and take action based on events. For example, a toolbar element might filter a list when a menu item is selected; a login element might process a login when it handles a click on the login button.

## Listening to events

In addition to the standard `addEventListener` API, Lit introduces a declarative way to add event listeners.

### Adding event listeners in the element template

You can use `@` expressions in your template to add event listeners to elements in your component's template. Declarative event listeners are added when the template is rendered.

{% playground-example "v3-docs/components/events/child/" "my-element.ts" %}

#### Customizing event listener options {#event-options-decorator}

If you need to customize the event options used for a declarative event listener (like `passive` or `capture`), you can specify these on the listener using the `@eventOptions` decorator. The object passed to `@eventOptions` is passed as the `options` parameter to `addEventListener`.

```js
import {LitElement, html} from 'lit';
import {eventOptions} from 'lit/decorators.js';
//...
@eventOptions({passive: true})
private _handleTouchStart(e) { console.log(e.type) }
```

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you’ll need to use a compiler like Babel or TypeScript to use decorators. See [Enabling decorators](/docs/v3/components/decorators/#enabling-decorators) for details.

</div>

If you're not using decorators, you can customize event listener options by passing an object to the event listener expression. The object must have a `handleEvent()` method and can include any the options that would normally appear in the `options` argument to `addEventListener()`.

[comment]: <> (The `raw` macro is necessary to prevent the double handlebar in the code sample from messing with the liquid templating syntax)
{% raw %}

```js
render() {
  return html`<button @click=${{handleEvent: () => this.onClick(), once: true}}>click</button>`
}
```

{% endraw %}

### Adding event listeners to the component or its shadow root

To be notified of an event dispatched from the component's slotted children as well as children rendered into shadow DOM via the component template, you can add a listener to the component itself using the standard `addEventListener` DOM method. See [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on MDN for full details.

The component constructor is a good place to add event listeners on the component.

```js
constructor() {
  super();
  this.addEventListener('click', (e) => console.log(e.type, e.target.localName));
}
```

Adding event listeners to the component itself is a form of event delegation and can be done to reduce code or improve performance. See [event delegation](#event-delegation) for details. Typically when this is done, the event's `target` property is used to take action based on which element fired the event.

However, events fired from the component's shadow DOM are retargeted when heard by an event listener on the component. This means the event target is the component itself. See [Working with events in shadow DOM](#shadowdom) for more information.

Retargeting can interfere with event delegation, and to avoid it, event listeners can be added to the component's shadow root itself. Since the `shadowRoot` is not available in the `constructor`, event listeners can be added in the `createRenderRoot` method as follows. Please note that it's important to make sure to return the shadow root from the `createRenderRoot` method.

{% playground-example "v3-docs/components/events/host/" "my-element.ts" %}

### Adding event listeners to other elements

If your component adds an event listener to anything except itself or its templated DOM – for example, to `Window`, `Document`, or some element in the main DOM – you should add the listener in `connectedCallback` and remove it in `disconnectedCallback`.

*   Removing the event listener in `disconnectedCallback` ensures that any memory allocated by your component will be cleaned up when your component is destroyed or disconnected from the page.

*   Adding the event listener in `connectedCallback` (instead of, for example, the constructor or `firstUpdated`) ensures that your component will re-create its event listener if it is disconnected and subsequently reconnected to DOM.

```js
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this._handleResize);
}
disconnectedCallback() {
  window.removeEventListener('resize', this._handleResize);
  super.disconnectedCallback();
}
```

See the MDN documentation on using custom elements [lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) for more information on `connectedCallback` and `disconnectedCallback`.

### Optimizing for performance

Adding event listeners is extremely fast and typically not a performance concern. However, for components that are used in high frequency and need a lot of event listeners, you can optimize first render performance by reducing the number of listeners used via [event delegation](#event-delegation) and adding listeners [asynchronously](#async-events) after rendering.

#### Event delegation { #event-delegation }

Using event delegation can reduce the number of event listeners used and therefore improve performance. It is also sometimes convenient to centralize event handling to reduce code. Event delegation can only be use to handle events that `bubble`. See [Dispatching events](#dispatching-events) for details on bubbling.

Bubbling events can be heard on any ancestor element in the DOM. You can take advantage of this by adding a single event listener on an ancestor component to be notified of a bubbling event dispatched by any of its descendants in the DOM. Use the event's `target` property to take specific action based on the element that dispatched the event.

{% playground-example "v3-docs/components/events/delegation/" "my-element.ts" %}

#### Asynchronously adding event listeners { #async-events }

To add an event listener after rendering, use the `firstUpdated` method. This is a Lit lifecycle callback which runs after the component first updates and renders its templated DOM.

The `firstUpdated` callback fires after the first time your component has been updated and called its `render` method, but **before** the browser has had a chance to paint.

See [firstUpdated](/docs/v3/components/lifecycle/#firstupdated) in the Lifecycle documentation for more information.

To ensure the listener is added after the user can see the component, you can await a Promise that resolves after the browser paints.

```js
async firstUpdated() {
  // Give the browser a chance to paint
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

### Understanding `this` in event listeners

Event listeners added using the declarative `@` syntax in the template are automatically _bound_ to the component.

Therefore, you can use `this` to refer to your component instance inside any declarative event handler:

```js
class MyElement extends LitElement {
  render() {
    return html`<button @click="${this._handleClick}">click</button>`;
  }
  _handleClick(e) {
    console.log(this.prop);
  }
}
```

When adding listeners imperatively with `addEventListener`, you'll want to use an arrow function so that `this` refers to the component:

```ts
export class MyElement extends LitElement {
  private _handleResize = () => {
    // `this` refers to the component
    console.log(this.isConnected);
  }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

See the [documentation for `this` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) for more information.

### Listening to events fired from repeated templates

When listening to events on repeated items, it's often convenient to use [event delegation](#event-delegation) if the event bubbles. When an event does not bubble, a listener can be added on the repeated elements. Here's an example of both methods:

{% playground-example "v3-docs/components/events/list/" "my-element.ts" %}

### Removing event listeners

Passing `null`, `undefined` or `nothing` to an `@` expression will cause any existing listener to be removed.

## Dispatching events { #dispatching-events }

All DOM nodes can dispatch events using the `dispatchEvent` method. First, create an event instance, specifying the event type and options. Then pass it to `dispatchEvent` as follows:

```js
const event = new Event('my-event', {bubbles: true, composed: true});
myElement.dispatchEvent(event);
```

The `bubbles` option allows the event to flow up the DOM tree to ancestors of the dispatching element. It's important to set this flag if you want the event to be able to participate in [event delegation](#event-delegation).

The `composed` option is useful to set to allow the event to be dispatched above the shadow DOM tree in which the element exists.

See [Working with events in shadow DOM](#shadowdom) for more information.

See [EventTarget.dispatchEvent()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) on MDN for a full description of dispatching events.

### When to dispatch an event

Events should be dispatched in response to user interaction or asynchronous changes in the component's state. They should generally **not** be dispatched in response to state changes made by the owner of the component via its property or attribute APIs. This is generally how native web platform elements work.

For example, when a user types a value into an `input` element a `change` event is dispatched, but if code sets the `input`'s `value` property, a `change` event is **not** dispatched.

Similarly, a menu component should dispatch an event when the user selects a menu item, but it should not dispatch an event if, for example, the menu's `selectedItem` property is set.

This typically means that a component should dispatch an event in response to another event to which it is listening.

{% playground-ide "v3-docs/components/events/dispatch/" "my-dispatcher.ts" %}

### Dispatching events after an element updates

Often, an event should be fired only after an element updates and renders. This might be necessary if an event is intended to communicate a change in rendered state based on user interaction. In this case, the component's `updateComplete` Promise can be awaited after changing state, but before dispatching the event.

{% playground-ide "v3-docs/components/events/update/" "my-dispatcher.ts" %}

### Using standard or custom events { #standard-custom-events }

Events can be dispatched either by constructing an `Event` or a `CustomEvent`. Either is a reasonable approach. When using a `CustomEvent`, any event data is passed in the event's `detail` property. When using an `Event`, an event subclass can be made and custom API attached to it.

See [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event) on MDN for details about constructing events.

#### Firing a custom event:

```js
const event = new CustomEvent('my-event', {
  detail: {
    message: 'Something important happened'
  }
});
this.dispatchEvent(event);
```

See the [MDN documentation on custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) for more information.

#### Firing a standard event:

```js
class MyEvent extends Event {
  constructor(message) {
    super();
    this.type = 'my-event';
    this.message = message;
  }
}

const event = new MyEvent('Something important happened');
this.dispatchEvent(event);
```

## Working with events in shadow DOM {#shadowdom}

When using shadow DOM there are a few modifications to the standard event system that are important to understand. Shadow DOM exists primarily to provide a scoping mechanism in the DOM that encapsulates details about these "shadow" elements. As such, events in shadow DOM encapsulate certain details from outside DOM elements.

### Understanding composed event dispatching {#shadowdom-composed}

By default, an event dispatched inside a shadow root will not be visible outside that shadow root. To make an event pass through shadow DOM boundaries, you must set the [`composed` property](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) to `true`. It's common to pair `composed` with `bubbles` so that all nodes in the DOM tree can see the event:

```js
_dispatchMyEvent() {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true });
  this.dispatchEvent(myEvent);
}
```

If an event is `composed` and does `bubble`, it can be received by all ancestors of the element that dispatches the event—including ancestors in outer shadow roots. If an event is `composed` but does not `bubble`, it can only be received on the element that dispatches the event and on the host element containing the shadow root.

Note that most standard user interface events, including all mouse, touch, and keyboard events, are both bubbling and composed. See the [MDN documentation on composed events](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed) for more information.

### Understanding event retargeting {#shadowdom-retargeting}

[Composed](#shadowdom-composed) events dispatched from within a shadow root are retargeted, meaning that to any listener on an element hosting a shadow root or any of its ancestors, they appear to come from the hosting element. Since Lit components render into shadow roots, all composed events dispatched from inside a Lit component appear to be dispatched by the Lit component itself. The event's `target` property is the Lit component.

```html
<my-element onClick="(e) => console.log(e.target)"></my-element>
```

```js
render() {
  return html`
    <button id="mybutton" @click="${(e) => console.log(e.target)}">
      click me
    </button>`;
}
```

In advanced cases where it is required to determine the origin of an event, use the `event.composedPath()` API. This method returns an array of all the nodes traversed by the event dispatch, including those within shadow roots. Because this breaks encapsulation, care should be taken to avoid relying on implementation details that may be exposed.  Common use cases include determining if the element clicked was an anchor tag, for purposes of client-side routing.

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```
See the [MDN documentation on composedPath](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath) for more information.

## Communicating between the event dispatcher and listener

Events exist primarily to communicate changes from the event dispatcher to the event listener, but events can also be used to communicate information from the listener back to the dispatcher.

One way you can do this is to expose API on events which listeners can use to customize component behavior. For example, a listener can set a property on a custom event's detail property which the dispatching component then uses to customize behavior.

Another way to communicate between the dispatcher and listener is via the `preventDefault()` method. It can be called to indicate the event's standard action should not occur. When the listener calls `preventDefault()`, the event's `defaultPrevented` property becomes true. This flag can then be used by the listener to customize behavior.

Both of these techniques are used in the following example:

{% playground-ide "v3-docs/components/events/comm/" "my-listener.ts" %}
