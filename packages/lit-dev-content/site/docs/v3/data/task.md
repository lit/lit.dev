---
title: Async Tasks
eleventyNavigation:
  key: Async Tasks
  parent: Managing Data
  order: 2
---

## Overview

Sometimes a component needs to render data that is only available _asynchronously_. Such data might be fetched from a server, a database, or in general retrieved or computed from an async API.

While Lit's reactive update lifecycle is batched and asynchronous, Lit templates always render _synchronously_. The data used in a template must be readable at the time of rendering. To render async data in a Lit component, you must wait for the data to be ready, store it so that it's readable, then trigger a new render which can use the data synchronously. Considerations must often be made on what to render while the data is being fetched, or when the data fetch fails as well.

The `@lit/task` package provides a `Task` reactive controller to help manage this async data workflow.

`Task` is a controller that takes an async task function and runs it either manually or automatically when its arguments change. Task stores the result of the task function and updates the host element when the task function completes so the result can be used in rendering.

### Example

This is an example of using `Task` to call an HTTP API via [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). The API is called whenever the `productId` parameter changes, and the component renders a loading message when the data is being fetched.

{% switchable-sample %}

```ts
import {Task} from '@lit/task';

class MyElement extends LitElement {
  @property() productId?: string;

  private _productTask = new Task(this, {
    task: async ([productId], {signal}) => {
      const response = await fetch(`http://example.com/product/${productId}`, {signal});
      if (!response.ok) { throw new Error(response.status); }
      return response.json() as Product;
    },
    args: () => [this.productId]
  });

  render() {
    return this._productTask.render({
      pending: () => html`<p>Loading product...</p>`,
      complete: (product) => html`
          <h1>${product.name}</h1>
          <p>${product.price}</p>
        `,
      error: (e) => html`<p>Error: ${e}</p>`
    });
  }
}
```

```js
import {Task} from '@lit/task';

class MyElement extends LitElement {
  static properties = {
    productId: {},
  };

  _productTask = new Task(this, {
    task: async ([productId], {signal}) => {
      const response = await fetch(`http://example.com/product/${productId}`, {signal});
      if (!response.ok) { throw new Error(response.status); }
      return response.json();
    },
    args: () => [this.productId]
  });

  render() {
    return this._productTask.render({
      pending: () => html`<p>Loading product...</p>`,
      complete: (product) => html`
          <h1>${product.name}</h1>
          <p>${product.price}</p>
        `,
      error: (e) => html`<p>Error: ${e}</p>`
    });
  }
}
```

{% endswitchable-sample %}

### Features

Task takes care of a number of things needed to properly manage async work:
- Gathers task arguments when the host updates
- Runs task functions when arguments change
- Tracks the task status (initial, pending, complete, or error)
- Saves the last completion value or error of the task function
- Triggers a host update when the task changes status
- Handles race conditions, ensuring that only the latest task invocation completes the task
- Renders the correct template for the current task status
- Allows aborting tasks with an [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

This removes most of the boilerplate for correctly using async data from your code, and ensures robust handling of race conditions and other edge-cases.

## What is async data?

Async data is data that's not available immediately, but may be available at some time in the future. For example, instead of a value like a string or an object that's usable synchronously, a promise provides a value in the future.

Async data is usually returned from an async API, which can come in a few forms:
- Promises or async functions, like `fetch()`
- Functions that accept callbacks
- Objects that emit events, such as DOM events
- Libraries like observables and signals

The Task controller deals in promises, so no matter the shape of your async API you can adapt it to promises to use with Task.

## What is a task?

At the core of the Task controller is the concept of a "task" itself.

A task is an async operation which does some work to produce data and return it in a Promise. A task can be in a few different states (initial, pending, complete, and error) and can take parameters.

A task is a generic concept and could represent any async operation. They apply best when there is a request/response structure, such as a network fetch, database query, or waiting for a single event in response to some action. They're less applicable to spontaneous or streaming operations like an open-ended stream of events, a streaming database response, etc.

## Installation

```bash
npm install @lit/task
```

## Usage

`Task` is a [reactive controller](/docs/v3/composition/controllers/), so it can respond to and trigger updates to Lit's reactive update lifecycle.

You'll generally have one Task object for each logical task that your component needs to perform. Install tasks as fields on your class:

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _myTask = new Task(this, {/*...*/});
}
```

```js
class MyElement extends LitElement {
  _myTask = new Task(this, {/*...*/});
}
```

{% endswitchable-sample %}


As a class field, the task status and value are easily available:

```ts
this._task.status;
this._task.value;
```

### The task function

The most critical part of a task declaration is the _task function_. This is the function that does the actual work.

The task function is given in the `task` option. The Task controller will automatically call the task function with arguments, which are supplied with a separate `args` callback. Arguments are checked for changes and the task function is only called if the arguments have changed.

The task function takes the task arguments as an _array_ passed as the first parameter, and an options argument as the second parameter:

```ts
new Task(this, {
  task: async ([arg1, arg2], {signal}) => {
    // do async work here
  },
  args: () => [this.field1, this.field2]
})
```

The task function's args array and the args callback should be the same length.

{% aside "positive" "no-header" %}

Write the `task` and `args` functions as arrow functions so that the `this` reference points to the host element.

{% endaside %}

### Task status

Tasks can be in one of four states:
- `INITIAL`: The task has not been run
- `PENDING`: The task is running and awaiting a new value
- `COMPLETE`: The task completed successfully
- `ERROR`: The task errored

The Task status is available at the `status` field of the Task controller, and is represented by the `TaskStatus` enum-like object, which has properties `INITIAL`, `PENDING`, `COMPLETE`, and `ERROR`.

```ts
import {TaskStatus} from '@lit/task';

// ...
  if (this.task.status === TaskStatus.ERROR) {
    // ...
  }
```

Usually a Task will proceed from `INITIAL` to `PENDING` to one of `COMPLETE` or `ERROR`, and then back to `PENDING` if the task is re-run. When a task changes status it triggers a host update so the host element can handle the new task status and render if needed.

{% aside "info" "no-header" %}

It's important to understand the status a task can be in, but it's not usually necessary to access it directly.

{% endaside %}

There are a few members on the Task controller that relate to the state of the task:
- `status`: the status of the task.
- `value`: the current value of the task, if it has completed.
- `error`: the current error of the task, if it has errored.
- `render()`: a method that chooses a callback to run based on the current status.

### Rendering Tasks

The simplest and most common API to use to render a task is `task.render()`, since it chooses the right code to run and provides it the relevant data.

`render()` takes a config object with an optional callback for each task status:
- `initial()`
- `pending()`
- `complete(value)`
- `error(err)`

You can use `task.render()` inside a Lit `render()` method to render templates based on the task status:

```ts
  render() {
    return html`
      ${this._myTask.render({
        initial: () => html`<p>Waiting to start task</p>`,
        pending: () => html`<p>Running task...</p>`,
        complete: (value) => html`<p>The task completed with: ${value}</p>`,
        error: (error) => html`<p>Oops, something went wrong: ${error}</p>`,
      })}
    `;
  }
```

### Running tasks

By default, Tasks will run any time the arguments change. This is controlled by the `autoRun` option, which defaults to `true`.

#### Auto-run

In _auto-run_ mode, the task will call the `args` function when the host has updated, compare the args to the previous args, and invoke the task function if they have changed. A task without `args` defined is in manual mode.

#### Manual mode

If `autoRun` is set to false, the task will be in _manual_ mode. In manual mode you can run the task by calling the `.run()` method, possibly from an event handler:

{% switchable-sample %}

```ts
class MyElement extends LitElement {

  private _getDataTask = new Task(
    this,
    {
      task: async () => {
        const response = await fetch(`example.com/data/`);
        return response.json();
      },
      args: () => []
    }
  );

  render() {
    return html`
      <button @click=${this._onClick}>Get Data</button>
    `;
  }

  private _onClick() {
    this._getDataTask.run();
  }
}
```

```js
class MyElement extends LitElement {

  _getDataTask = new Task(
    this,
    {
      task: async () => {
        const response = await fetch(`example.com/data/`);
        return response.json();
      },
      args: () => []
    }
  );

  render() {
    return html`
      <button @click=${this._onClick}>Get Data</button>
    `;
  }

  _onClick() {
    this._getDataTask.run();
  }
}
```

{% endswitchable-sample %}

In manual mode you can provide new arguments directly to `run()`:

```ts
this._task.run('arg1', 'arg2');
```

If arguments are not provided to `run()`, they are gathered from the `args` callback.

### Aborting tasks

A task function can be called while previous task runs are still pending. In these cases the result of the pending task runs will be ignored, and you should try to cancel any outstanding work or network I/O in order to save resources.

You can do with with the [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that is passed in the `signal` property of the second argument to the task function. When a pending task run is superseded by a new run, the `AbortSignal` that was passed to the pending run is aborted to signal the task run to cancel any pending work.

`AbortSignal` doesn't cancel any work automatically - it is just a signal. To cancel some work you must either do it yourself by checking the signal, or forward the signal to another API that accepts `AbortSignal`s like [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) or [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

The easiest way to use the `AbortSignal` is to forward it to an API that accepts it, like `fetch()`.

{% switchable-sample %}

```ts
  private _task = new Task(this, {
    task: async (args, {signal}) => {
      const response = await fetch(someUrl, {signal});
      // ...
    },
  });
```

```js
  _task = new Task(this, {
    task: async (args, {signal}) => {
      const response = await fetch(someUrl, {signal});
      // ...
    },
  });
```

{% endswitchable-sample %}

Forwarding the signal to `fetch()` will cause the browser to cancel the network request if the signal is aborted.

You can also check if a signal has been aborted in your task function. You should check the signal after returning to a task function from an async call. `throwIfAborted()` is a convenient way to do this:

{% switchable-sample %}

```ts
  private _task = new Task(this, {
    task: async ([arg1], {signal}) => {
      const firstResult = await doSomeWork(arg1);
      signal.throwIfAborted();
      const secondResult = await doMoreWork(firstResult);
      signal.throwIfAborted();
      return secondResult;
    },
  });
```

```js
  _task = new Task(this, {
    task: async ([arg1], {signal}) => {
      const firstResult = await doSomeWork(arg1);
      signal.throwIfAborted();
      const secondResult = await doMoreWork(firstResult);
      signal.throwIfAborted();
      return secondResult;
    },
  });
```

{% endswitchable-sample %}

### Task chaining

Sometimes you want to run one task when another task completes.
This can be useful if the tasks have different arguments so that the chained task may run without the first task running again.
In this case it'll use the first task like a cache. To do this you can use the value of a task as an argument to another task:

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _getDataTask = new Task(this, {
    task: ([dataId]) => getData(dataId),
    args: () => [this.dataId],
  });

  private _processDataTask = new Task(this, {
    task: ([data, param]) => processData(data, param),
    args: () => [this._getDataTask.value, this.param],
  });
}
```

```js
class MyElement extends LitElement {
  _getDataTask = new Task(this, {
    task: ([dataId]) => getData(dataId),
    args: () => [this.dataId],
  });

  _processDataTask = new Task(this, {
    task: ([data, param]) => processData(data, param),
    args: () => [this._getDataTask.value, this.param],
  });
}
```

{% endswitchable-sample %}

You can also often use one task function and await intermediate results:

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _getDataTask = new Task(this, {
    task: ([dataId, param]) => {
      const data = await getData(dataId);
      return processData(data, param);
    },
    args: () => [this.dataId, this.param],
  });
}
```

```js
class MyElement extends LitElement {
  _getDataTask = new Task(this, {
    task: ([dataId, param]) => {
      const data = await getData(dataId);
      return processData(data, param);
    },
    args: () => [this.dataId, this.param],
  });
}
```

{% endswitchable-sample %}
