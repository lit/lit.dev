---
title: Async Tasks
eleventyNavigation:
  key: Async Tasks
  parent: Managing Data
  order: 2
  labs: true
---

**DRAFT**

{% labs-disclaimer %}

## Overview

Sometimes a component needs to render data that is not synchronously available (i.e. not an value provided via a [property](../../components/properties/), [context](../context/), a state management library, etc.) but only _asynchronously_ available. Such data might be fetched from a server, a local database (like IndexedDB or LocalStorage), or computed.

While Lit's reactive update lifecycle is batched and asynchronous, Lit _templates_ always renders synchronously. Handling async data requires collecting that data and triggering a new update, which will render the data synchronously when it runs.

The `@lit-labs/task` package provides a `Task` reactive controller to help manage this and more aspects of async operations.

```ts
import {Task} from '@lit-labs/task';

class MyElement extends LitElement {
  @property()
  productId?: number;

  private _apiTask = new Task(
    this,
    {
      task: async ([productId]) =>
        const response = await fetch(`example.com/product/${productId}`);
        return response.json();
      ),
      args: () => [this.productId]
    }
  );

  render() {
    return html`
      ${this._apiTask.render({
        pending: () => html`
          <div class="loading">Loading product...</div>
        `,
        complete: (product) => html`
          <h1>${product.name}</h1>
          <p>${product.price}</p>
        `,
      })}
    `;
  }
}
```

The Task controller takes care of a number of things needed to properly manage async work:
- Gathers task arguments when the host updates
- Starts task functions when the arguments change
- Tracks the task status (initial, pending, complete, or error)
- Saves the completion value or error of the task function
- Triggers a host update when the task changes status
- Handles race conditions, ensuring that only the latest task invocation completes the task
- Renders the correct template for the current task status

This removes most of the boilerplate for correctly using async data from your code, and ensures robust handling of race conditions and other edge-cases.

## Installation

```bash
npm i @lit-labs/task
```

## Usage

`Task` is a [reactive controller](../../composition/controllers/), so it can respond to and trigger updates to Lit's reactive update lifecycle.

You'll generally have one Task object for each logical task that your component needs to perform. Install tasks as fields on your class:

```ts
class MyElement extends LitElement {
  private _myTask = new Task(this, {/*...*/});
}
```

As a class field, the task status and value are easily available:

```ts
this._task.value
```

### Arguments and the task function

The most critical part of a task declaration is the _task function_. This is the function that does the actual work. The Task controller will automatically call the task function with arguments, which have to be supplied with a separate callback. Arguments are separate so they can be checked for changes and the task function only called if the arguments have changed.

The task function takes the task arguments as an _array_ passed as the first parameter

```ts
new Task(this, {
  task: async ([arg1, arg2]) => {
    // do async work here
  },
  args: () => [this.field1, this.field2]
})
```

Write the `task` and `args` functions as arrow function so that the `this` reference points to the host element.

### Handling results

When a task completes or otherwise changes status, it triggers a host update so the host can handle the new task status and render if needed.

There are a few members on Task that represent the state of the task:
- `value`: the current value of the task, if it has completed
- `error`: the current error of the task, if it has errored
- `status`: the status of the task. See [Task status](#task-status)
- `render()`: A method that chooses a callback to run based on the current status.

The simplest and most common API to use is `render()`, since it chooses the right code to run and provides it the relevant data.

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

By default, Tasks will run any time the arguments change. This is controlled by the `autoRun` option, which default to `true`.

In auto-run mode, the task will call the `args` function when the host has updated, compare the args to the previous args, and invoke the task function if they have changed.

If `autoRun` is set to false, the task will be in _manual_ mode. In manual mode you can run the task by calling the `.run()` method, possibly from an event handler:

```ts
class MyElement extends LitElement {

  private _getData = new Task(
    this,
    {
      task: async () =>
        const response = await fetch(`example.com/data/`);
        return response.json();
      ),
      args: () => []
    }
  );

  render() {
    return html`
      <button @click=${this._onClick}>Get Data</button>
    `;
  }

  private _onClick() {
    this._getData.run();
  }
}
```

In manual mode you can provide new arguments directly to `run()`:

```ts
this._myTask.run('arg1', 'arg2');
```

If arguments are not provided to `run()`, they are gathered from the `args` callback.

### Task status

Tasks can be in one of four states:
- `INITIAL`: The task has not been run
- `PENDING`: The task is running and awaiting a new value
- `COMPLETE`: The task completed successfully
- `ERROR`: The task errored

Usually a Task will proceed from INITIAL to PENDING to one of COMPLETE or ERROR, and then back to PENDING if the task is re-run.

It's important to understand the status a task can be in, but it's not usually necessary to access it directly.

Task status is available at the `status` field of the Task controller, and is represented by the `TaskStatus` object.

```ts
import {TaskStatus} from '@lit-labs/task';

// ...

  if (this.task.status === TaskStatus.ERROR) {
    // ...
  }
```

### Task chaining

Sometimes you want to run one task when another task completes. To do this you can use the value of a task as an argument to the other:

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

This can be useful if the tasks have different arguments so that the chained task may run without the first task running again. In this case it'll use the first task like a cache.

You can also often use one task function and await intermediate results:

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

### Race conditions

_TODO: A task function can be called while previous task calls are still pending..._
