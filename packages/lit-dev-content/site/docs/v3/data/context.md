---
title: Context
eleventyNavigation:
  key: Context
  parent: Managing Data
  order: 1
versionLinks:
  v2: data/context/
---

Context is a way of making data available to entire component subtrees without having to manually bind properties to every component. The data is "contextually" available, such that ancestor elements in between a provider of data and consumer of data aren't even aware of it.

Lit's context implementation is available in the `@lit/context` package:

```bash
npm i @lit/context
```

Context is useful for data that needs to be consumed by a wide variety and large number of components - things like an app's data store, the current user, a UI theme - or when data-binding isn't an option, such as when an element needs to provide data to its light DOM children.

Context is very similar to React's Context, or to dependency injection systems like Angular's, with some important differences that make Context work with the dynamic nature of the DOM, and enable interoperability across different web components libraries, frameworks and plain JavaScript.

## Example

Using context involves a _context object_ (sometimes called a key), a _provider_ and a _consumer_, which communicate using the context object.

Context definition (`logger-context.ts`):
```ts
import {createContext} from '@lit/context';
import type {Logger} from 'my-logging-library';
export type {Logger} from 'my-logging-library';
export const loggerContext = createContext<Logger>('logger');
```

Provider:
```ts
import {LitElement, property, html} from 'lit';
import {provide} from '@lit/context';

import {Logger} from 'my-logging-library';
import {loggerContext} from './logger-context.js';

@customElement('my-app')
class MyApp extends LitElement {

  @provide({context: loggerContext})
  logger = new Logger();

  render() {
    return html`...`;
  }
}
```

Consumer:
```ts
import {LitElement, property} from 'lit';
import {consume} from '@lit/context';

import {type Logger, loggerContext} from './logger-context.js';

export class MyElement extends LitElement {

  @consume({context: loggerContext})
  @property({attribute: false})
  public logger?: Logger;

  private doThing() {
    this.logger?.log('A thing was done');
  }
}
```

## Key Concepts

### Context Protocol
Lit's context is based on the [Context Community Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) by the W3C's [Web Components Community Group](https://www.w3.org/community/webcomponents/).

This protocol enables interoperability between elements (or even non-element code) regardless of how they were built. Via the context protocol, a Lit-based element can provide data to a consumer not built with Lit, or vice versa.

The Context Protocol is based on DOM events. A consumer fires a `context-request` event that carries the context key that it wants, and any element above it can listen for the `context-request` event and provide data for that context key.

`@lit/context` implements this event-based protocol and makes it available via a few reactive controllers and decorators.

### Context Objects

Contexts are identified by _context objects_ or _context keys_. They are objects that represent some potential data to be shared by the context object identity. You can think of them as similar to Map keys.

### Providers

Providers are usually elements (but can be any event handler code) that provide data for specific context keys.

### Consumers

Consumers request data for specific context keys.

### Subscriptions

When a consumer requests data for a context, it can tell the provider that it wants to _subscribe_ to changes in the context. If the provider has new data, the consumer will be notified and can automatically update.

## Usage

### Defining a context

Every usage of context must have a context object to coordinate the data request. This context object represents the identity and type of data that is provided.

Context objects are created with the `createContext()` function:

```ts
export const myContext = createContext(Symbol('my-context'));
```

It is recommended to put context objects in their own module so that they're importable independent of specific providers and consumers.

#### Context type-checking

`createContext()` takes any value and returns it directly. In TypeScript, the value is cast to a typed `Context` object, which carries the type of the context _value_ with it.

In case of a mistake like this:
```ts
const myContext = createContext<Logger>(Symbol('logger'));

class MyElement extends LitElement {
  @provide({context: myContext})
  name: string
}
```

TypeScript will warn that the type `string` is not assignable to the type `Logger`. Note that this check is currently only for public fields.

<!-- 
  TODO https://github.com/lit/lit/issues/3926 this will likely need to be updated once we move to standard decorators.
 -->

#### Context equality

Context objects are used by providers to match a context request event to a value. Contexts are compared with strict equality (`===`), so a provider will only handle a context request if its context key equals the context key of the request.

This means that there are two main ways to create a context object:
1. With a value that is globally unique, like an object (`{}`)  or symbol (`Symbol()`)
2. With a value that is not globally unique, so that it can be equal under strict equality, like a string (`'logger'`) or _global_ symbol (`Symbol.for('logger')`).

If you want two _separate_ `createContext()` calls to refer to the same
context, then use a key that will be equal under strict equality like a
string:
```ts
// true
createContext('my-context') === createContext('my-context')
```

Beware though that two modules in your app could use the same context key to refer to different objects. To avoid unintended collisions you may want to use a relatively unique string, e.g. like `'console-logger'` instead of `'logger'`.

Usually it's best to use a globally unique context object. Symbols are one of the easiest ways to do this.

### Providing a context

There are two ways in `@lit/context` to provide a context value: the ContextProvider controller and the `@provide()` decorator.

#### `@provide()`

The `@provide()` decorator is the easiest way to provide a value if you're using decorators. It creates a ContextProvider controller for you.

Decorate a property with `@provide()` and give it the context key:
```ts
import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {provide} from '@lit/context';
import {myContext, MyData} from './my-context.js';

class MyApp extends LitElement {
  @provide({context: myContext})
  myData: MyData;
}
```

You can make the property also a reactive property with `@property()` or `@state()` so that setting it will update the provider element as well as context consumers.

```ts
  @provide({context: myContext})
  @property({attribute: false})
  myData: MyData;
```

Context properties are often intended to be private. You can make private properties reactive with `@state()`:

```ts
  @provide({context: myContext})
  @state()
  private _myData: MyData;
```

Making a context property public lets an element provide a public field to its child tree:

```ts
  html`<my-provider-element .myData=${someData}>`
```

#### ContextProvider

`ContextProvider` is a reactive controller that manages `context-request` event handlers for you.

```ts
import {LitElement, html} from 'lit';
import {ContextProvider} from '@lit/context';
import {myContext} from './my-context.js';

export class MyApp extends LitElement {
  private _provider = new ContextProvider(this, {context: myContext});
}
```

ContextProvider can take an initial value as an option in the constructor:

```ts
  private _provider = new ContextProvider(this, {context: myContext, initialValue: myData});
```

Or you can call `setValue()`:
```ts
  this._provider.setValue(myData);
```

### Consuming a context

#### `@consume()` decorator

The `@consume()` decorator is the easiest way to consume a value if you're using decorators. It creates a ContextConsumer controller for you.

Decorate a property with `@consume()` and give it the context key:
```ts
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {myContext, MyData} from './my-context.js';

class MyElement extends LitElement {
  @consume({context: myContext})
  myData: MyData;
}
```

When this element is connected to the document, it will automatically fire a `context-request` event, get a provided value, assign it to the property, and trigger an update of the element.

#### ContextConsumer

ContextConsumer is a reactive controller that manages dispatching the `context-request` event for you. The controller will cause the host element to update when new values are provided. The provided value is then available at the `.value` property of the controller.

```ts
import {LitElement, property} from 'lit';
import {ContextConsumer} from '@lit/context';
import {myContext} from './my-context.js';

export class MyElement extends LitElement {
  private _myData = new ContextConsumer(this, {context: myContext});

  render() {
    const myData = this._myData.value;
    return html`...`;
  }
}
```

#### Subscribing to contexts

Consumers can subscribe to context values so that if a provider has a new value, it can give it to all subscribed consumers, causing them to update.

You can subscribe with the `@consume()` decorator:

```ts
  @consume({context: myContext, subscribe: true})
  myData: MyData;
```

and the ContextConsumer controller:

```ts
  private _myData = new ContextConsumer(this,
    {
      context: myContext,
      subscribe: true,
    }
  );
```

## Example Use Cases

### Current user, locale, etc.

The most common context use cases involve data that is global to a page and possibly only sparsely needed in components throughout the page. Without context it's possible that most or all components would need to accept and propagate reactive properties for the data.

### Services

App-global services, like loggers, analytics, data stores, can be provided by context. An advantage of context over importing from a common module are the late coupling and tree-scoping that context provides. Tests can easily provide mock services, or different parts of the page can be given different service instances.

### Themes

Themes are sets of styles that apply to the entire page or entire subtrees within the page - exactly the kind of scope of data that context provides.

One way of building a theme system would be to define a `Theme` type that containers can provide that holds named styles. Elements that want to apply a theme can consume the theme object and look up styles by name. Custom theme reactive controllers can wrap ContextProvider and ContextConsumer to reduce boilerplate.

### HTML-based plugins

Context can be used to pass data from a parent to its light DOM children. Since the parent does usually not create the light DOM children, it cannot leverage template-based data-binding to pass data to them, but it can listen to and respond to `context-request` events.

For example, consider a code editor element with plugins for different language modes. You can make a plain HTML system for adding features using context:

```html
<code-editor>
  <code-editor-javascript-mode></code-editor-javascript-mode>
  <code-editor-python-mode></code-editor-python-mode>
</code-editor>
```

In this case `<code-editor>` would provide an API for adding language modes via context, and plugin elements would consume that API and add themselves to the editor.

### Data formatters, link generators, etc.

Sometimes reusable components will need to format data or URLs in an application-specific way. For example, a documentation viewer that renders a link to another item. The component will not know the URL space of the application.

In these cases the component can depend on a context-provided function that will apply the application-specific formatting to the data or link.

## API

<div class="alert alert-info">

These API docs are a summary until generated API docs are available

</div>

### `createContext()`

Creates a typed Context object

**Import**:

```ts
import {property} from '@lit/context';
```

**Signature**:

```ts
function createContext<ValueType, K = unknown>(key: K): Context<K, ValueType>;
```


Contexts are compared with with strict equality.

If you want two separate `createContext()` calls to referrer to the same context, then use a key that will by equal under strict equality like a string for `Symbol.for()`:

```ts
// true
createContext('my-context') === createContext('my-context')
// true
createContext(Symbol.for('my-context')) === createContext(Symbol.for('my-context'))
```

If you want a context to be unique so that it's guaranteed to not collide with other contexts, use a key that's unique under strict equality, like a `Symbol()` or object.:

```ts
// false
createContext(Symbol('my-context')) === createContext(Symbol('my-context'))
// false
createContext({}) === createContext({})
```

The `ValueType` type parameter is the type of value that can be provided by this context. It's uses to provide accurate types in the other context APIs.

### `@provide()`

A property decorator that adds a ContextProvider controller to the component making it respond to any `context-request` events from its children consumer.

**Import**:

```ts
import {provide} from '@lit/context';
```

**Signature**:

```ts
@provide({context: Context})
```

### `@consume()`

A property decorator that adds a ContextConsumer controller to the component which will retrieve a value for the property via the Context protocol.

**Import**:

```ts
import {consume} from '@lit/context';
```

**Signature**:

```ts
@consume({context: Context, subscribe?: boolean})
```

`subscribe` is `false` by default. Set it to `true` to subscribe to updates to the context provided value.

### `ContextProvider`

A ReactiveController which adds context provider behavior to a custom element by listening to `context-request` events.

**Import**:

```ts
import {ContextProvider} from '@lit/context';
```

**Constructor**:

```ts
ContextProvider(
  host: ReactiveElement,
  options: {
    context: T,
    initialValue?: ContextType<T>
  }
)
```

**Members**

- `setValue(v: T, force = false): void`

    Sets the value provided, and notifies any subscribed consumers of the new value if the value changed. `force` causes a notification even if the value didn't change, which can be useful if an object had a deep property change.


### `ContextConsumer`

A ReactiveController which adds context consuming behavior to a custom element by dispatching `context-request` events.

**Import**:

```ts
import {ContextConsumer} from '@lit/context';
```

**Constructor**:
```ts
ContextConsumer(
  host: HostElement,
  options: {
    context: C,
    callback?: (value: ContextType<C>, dispose?: () => void) => void,
    subscribe?: boolean = false
  }
)
```

**Members**

- `value: ContextType<C>`

   The current value for the context.

When the host element is connected to the document it will emit a `context-request` event with its context key. When the context request is satisfied the controller will invoke the callback, if present, and trigger a host update so it can respond to the new value.

It will also call the dispose method given by the provider when the host element is disconnected.

### `ContextRoot`

A ContextRoot can be used to gather unsatisfied context requests and re-dispatch them when new providers which satisfy matching context keys are available. This allows providers to be added to a DOM tree, or upgraded, after the consumers.

**Import**:

```ts
import {ContextRoot} from '@lit/context';
```

**Constructor**:
```ts
ContextRoot()
```

**Members**

- `attach(element: HTMLElement): void`

    Attaches the ContextRoot to this element and starts listening to `context-request` events.

- `detach(element: HTMLElement): void`

    Detaches the ContextRoot from this element, stops listening to `context-request` events.

### `ContextRequestEvent`

The event fired by consumers to request a context value. The API and behavior of this event is specified by the [Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md).

**Import**:

```ts
import {ContextRequestEvent} from '@lit/context';
```

The `context-request` bubbles and is composed.

**Members**

- `readonly context: C`

    The context object this event is requesting a value for

- `readonly callback: ContextCallback<ContextType<C>>`

    The function to call to provide a context value

- `readonly subscribe?: boolean`

    Whether the consumers wants to subscribe to new context values

### `ContextCallback`

A callback which is provided by a context requester and is called with the value satisfying the request.

This callback can be called multiple times by context providers as the requested value is changed.

**Import**:

```ts
import {type ContextCallback} from '@lit/context';
```

**Signature**:

```ts
type ContextCallback<ValueType> = (
  value: ValueType,
  unsubscribe?: () => void
) => void;
```
