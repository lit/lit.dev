---
title: Context
eleventyNavigation:
  key: Context
  parent: Components
  order: 9
versionLinks:
  v1: components/context/
---

Context is a way of making data available to entire component subtrees without having to manually bind properties to every component. The data is "contextually" available, such that ancestor elements in between a provider of data and consumer of data aren't event aware of it.

Lit's context implementation is part of Lit Labs and available in the `@lit-labs/context` package:

```bash
npm i @lit-labs/context
```

Context is useful for data that needs to be consumed by a wide variety and large number of components - things like an apps data store, the current user, a UI theme - or when data-binding isn't an option, such as when an element needs to provide data to its light DOM children.

Context is very in ways to React's Context, or to dependency injection systems like Angular's, with some important differences that enable interoperability across different web components libraries, frameworks and plain JavaScript.

## Example

Using context involves a _context object_ (sometimes called a key), a _provider_ and a _consumer_, which communicate using the context object.

Context definition (`logger-context.ts`):
```ts
import {createContext} from '@lit-labs/context';
import type {Logger} from 'my-logging-library';
export type {Logger} from 'my-logging-library';
export const loggerContext = createContext<Logger>('logger');
```

Provider:
```ts
import {LitElement, property, html} from 'lit';
import {provide} from '@lit-labs/context';

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
import {consume} from '@lit-labs/context';

import {type Logger, loggerContext} from './logger.js';

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

This protocol enables interoperability between elements (or even non-element code) regardless of how they were built. Via the context protocol, a Lit-based element can provide data to a Stencil consumer, or vice versa.

The Context Protocol is based on DOM events. A consumer fires a `context-request` event that carries the context key that it wants, and any element above it can listen for the `context-request` event and provide data if it has it for that context key.

`@lit-labs/context` implements this event-based protocol and makes it available via a few reactive controllers and decorators.

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

Context objects are created with the `createContext()` function. It is reccomended to put context objects in their own module so that they're independent of providers and consumers, unless the context is tightly coupled to a specific provider or consumer.

`createContext()` takes a name, which is useful for debugging.

Context objects in TypeScript are also typed: they have a generic type parameter that specifies the type of data provided with the context.

`my-context.ts`:
```ts
import {createContext} from '@lit-labs/context';
export interface MyData {
  // ...
}
export const loggerContext = createContext<MyData>('my-data');
```

### Providing a context

There are two ways in `@lit-labs/context` to provide a context value: the ContextProvider controller and the `@provide()` decorator.

#### `@provide()`

The `@provide()` decorator is the easiest way to provide a value if you're using decorators. It creates a ContextProvider controller for you.

Decorate a property with `@provide()` and give it the context key:
```ts
import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {provide} from '@lit-labs/context';
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
import {ContextProvider} from '@lit-labs/context';
import {myContext, MyData} from './my-context.js';

export class MyApp extends LitElement {
  private _provider = new ContextProvider(this, myContext);
}
```

ContextProvider can take an initial value in its constructor:

```ts
  private _provider = new ContextProvider(this, myContext, initialData);
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
import {property} from 'lit/decorators.js';
import {provide} from '@lit-labs/context';
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
import {ContextConsumer} from '@lit-labs/context';
import {Logger, loggerContext} from './logger.js';

export class MyElement extends LitElement {
  private _myData = new ContextConsumer(this, myContext);

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
    myContext,
    undedined, /* callback */
    true /* subscribe */
  );
```
