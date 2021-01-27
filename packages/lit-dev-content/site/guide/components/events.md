---
title: Events
eleventyNavigation:
  key: Events
  parent: Components
  order: 7
---

Events are the standard way that elements communicate changes to elements above them in the DOM. These changes typically occur due to user interaction. For example, a button dispatches a click event when a user clicks on it; an input dispatches a change event when the user enters a value in it. In addition to these standard events that are automatically dispatched, Lit elements can dispatch custom events. For example, a menu element might dispatch an event when the selected item changes; a popup element might dispatch an event when the popup opens or closes. This section describes best practices for listening to and firing events, as well as shadow DOM specific details for dealing with events.

## Listening to events

**TODO:** better intro

In plain HTML and JavaScript, this would be the `addEventListener` API:

```js
const myElement = document.querySelector('my-element');
myElement.addEventListener('my-event', (e) => {console.log(e)});
```

When you add an event listener imperatively, using `addEventListener`, you can specify various event listener options. For example, to use a passive event listener in plain JavaScript you'd do something like this:

```js
someElement.addEventListener('touchstart', this._handleTouchStart, {passive: true});
```

You need to add event listeners in a method that is guaranteed to fire before the event occurs.

More information:

*   [EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on MDN for a description of the event listener options.

### Adding event listeners in the element template

You can use `@` expressions in your template to add event listeners to your component.

```js
render() {
  return html`<button @click="${this._handleClick}">`;
}
```

Declarative event listeners are added when the template is rendered. This is usually the best way to add listeners to elements in your templated DOM.

**TODO:** below is redundant... incorporate or remove

If you want to listen to an event fired from a LitElement-based component from within another LitElement or from a lit-html template, you can use the lit-html declarative event syntax:

```html
<my-element @my-event="${(e) => { console.log(e.detail.message) }}"></my-element>
```

#### Using the `@eventOptions` decorator

The `@eventOptions` decorator allows you to add event listener options to a listener that's added declaratively in your template. The object passed to `@eventOptions` is used as the `options` parameter to `addEventListener`.

```js
import {LitElement, html, eventOptions} from 'lit-element';
...

@eventOptions({passive: true})
private _handleTouchStart() { ... }

render() {
  return html`
    <div @touchstart=${this._handleTouchStart}><div>
  `;
}
```

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you’ll need to use a compiler like Babel or TypeScript to use decorators. See [Using decorators](decorators) for details.

</div>

### Adding event listeners to the element or render root

To be notified of an event dispatched from the element's slotted children as well as children rendered into shadow DOM via the element template, you can add a listener to the element itself. See [Working with events in shadow DOM](#shadowdom) to see how retargeting affects events dispatched from elements in the shadow DOM.

**TODO:** see delegation

The component constructor is a good place to add event listeners on the host element itself.

```js
constructor() {
  super();
  this.addEventListener('focus', this._handleFocus);
}
```

Adding event listeners to the element's render root can be done in the `createRenderRoot` method.

**TODO:** why do this

```js
createRenderRoot() {
  const renderRoot = super.createRenderRoot();
  renderRoot.addEventListener('click', this._handleClick);
}
```

### Adding event listeners to other elements

`connectedCallback` is a lifecycle callback in the custom elements API. `connectedCallback` fires each time a custom element is appended into a document-connected element. See [the MDN documentation on using custom elements lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) for more information.

If your component adds an event listener to anything except itself or its children–for example, to `Window`, `Document`, or some element in the main DOM–you should add the listener in `connectedCallback` and remove it in `disconnectedCallback`.

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

When adding listeners imperatively with `addEventListener`, you'll need to bind the event listener yourself if you need a reference to the component instance. For example:

```js
this.boundResizeHandler = this.handleResize.bind(this);
window.addEventListener('resize', this.boundResizeHandler);
```

Or use an arrow function as a class field:

```ts
export class MyElement extends LitElement {
  private _handleResize = () => { /* handle the event */ }

  constructor() {
    window.addEventListener('resize', this._handleResize);
  }
}
```

See the [documentation for `this` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) for more information.

### Optimizing for performance

#### Asynchronously adding event listeners

Sometimes, you may want to defer adding an event listener until after first paint—for example, if you're adding a lot of listeners and first paint performance is critical.

LitElement doesn't have a specific lifecycle callback called after first paint, but you can use this pattern with the `firstUpdated` lifecycle callback:

```js
async firstUpdated() {
  // Give the browser a chance to paint
  await new Promise((r) => setTimeout(r, 0));
  this.addEventListener('click', this._handleClick);
}
```

`firstUpdated` fires after the first time your component has been updated and called its `render` method, but **before the browser has had a chance to paint**. The `Promise`/`setTimeout` line yields to the browser

See [firstUpdated](/guide/lifecycle#firstupdated) in the Lifecycle documentation for more information.

#### Event delegation

### Listening to events fired from repeated templates

## Dispatching events

**TODO:** describe dispatch options, especially bubbling and add note about composed

### Using standard or custom events

Fire a custom event:

```js
class MyElement extends LitElement {
  render() {
    return html`<div>Hello World</div>`;
  }
  firstUpdated(changedProperties) {
    let event = new CustomEvent('my-event', {
      detail: {
        message: 'Something important happened'
      }
    });
    this.dispatchEvent(event);
  }
}
```

Fire a standard event:

```js
class MyElement extends LitElement {
  render() {
    return html`<div>Hello World</div>`;
  }
  updated(changedProperties) {
    let click = new Event('click');
    this.dispatchEvent(click);
  }
}
```

### When to dispatch an event

### Dispatching events based on state changes

## Working with events in shadow DOM {#shadowdom}

### Understanding event retargeting

Bubbling events fired from within shadow DOM are retargeted so that, to any listener external to your component, they appear to come from your component itself.

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

When handling such an event, you can find where it originated from with `composedPath`:

```js
handleMyEvent(event) {
  console.log('Origin: ', event.composedPath()[0]);
}
```

### Understanding composed event dispatching

**TODO:** describe distinction between bubbling and composed

By default, a bubbling custom event fired inside shadow DOM will stop bubbling when it reaches the shadow root.

To make a custom event pass through shadow DOM boundaries, you must set both the `composed` and `bubbles` flags to `true`:

```js
firstUpdated(changedProperties) {
  let myEvent = new CustomEvent('my-event', {
    detail: { message: 'my-event happened.' },
    bubbles: true,
    composed: true });
  this.dispatchEvent(myEvent);
}
```

See the [MDN documentation on custom events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) for more information.

## Communicating between the event dispatcher and listener
