---
title: Signals
eleventyNavigation:
  key: Signals
  parent: Managing Data
  order: 3
  labs: true
---

{% labs-disclaimer %}

## Overview

### What are Signals?

Signals are data structures for managing observable state.

A signal can hold either a single value (a state signal) or a computation (a
computed signal) that depends on other signals. Signals are observable, so that
a consumer can be notified when they change. Because they form a dependency
graph, computed signals will re-compute and notify consumers when their
dependencies change.

Signals are very useful for modelling and managing shared observable state - for
UI components, that is state that many different components may access and/or
modify. When a signal is updated, every component that uses and watches that
signal, or any signals that depend on it, will update.

Signals is a general concept, with many different implementations and variations
on the idea found in JavaScript libraries and frameworks. There is also now a
TC39 proposal to standardize them as part of JavaScript.

Signal APIs typically have three main concepts:

- State signals, which hold a single value
- Computed signals, which wrap a computation that may depend on other signals.
- Watchers or effects, which run side-effectful code when signal values change.

### Example

Here is an example of signals with the proposed standard JavaScript signals API:

```ts
//
// Code developers might write to build their signals-based state...
//

// State signals hold values:
const count = new Signal.State(0);

// Computed signals wrap computations that use other signals:
const doubleCount = new Signal.Computed(() => count.get() * 2);

//
// Lower-level code of the sort that will typically be inside frameworks and
// signal-consuming libraries...
//

// Watchers are notified when signals that they watch change:
const watcher = new Signal.subtle.Watcher(async () => {
  // Notify callbacks are not allowed to access signals synchronously
  await 0;
  console.log('doubleCount is', doubleCount);
  // Watchers have to be re-enabled after they run:
  watcher.watch();
});
watcher.watch(doubleCount);

// Computed signals are lazy, so we need to read it to run the computation and
// potentially notify watchers:
doubleCount.get();
```

### Signal Libraries

There are many signal implementations build in JavaScript. Many are tightly
integrated into frameworks and only usable from within those frameworks, and
some are standalone libraries that are usable from any other code.

While there are some differences in the specific signals APIs, they are quite
similar.

Preact's signal library, `@preact/signals`, is a standalone library that is
relatively fast and small, so we built our first Lit Labs signals
integration package around it: `@lit-labs/preact-signals`.

### Signals Proposal for JavaScript

Because of the strong similarities between signal APIs, the growing use of
signals to implement reactivity in frameworks, and the desire for
interoperability between signal-using systems, a proposal for standardizing
signals is now underway in TC39 at https://github.com/tc39/proposal-signals

Lit provides the `@lit-labs/signals` package to integrate with the official
polyfill for this proposal.

This proposal is very exciting for the web components ecosystem. It means that
different web components don't have to use the same signals library to
interoperably consume and produce signals.

Standardized signals have the potential to replace or be the foundation for many
existing state management systems and observability libraries. Each of these
libraries, like MobX or Redux, currently require their own adapters to
ergonomically integrate with the Lit lifecycle. Signals standardization could
mean we need only one Lit adapter, and eventually no adapter at all as support
for signals is directly added to Lit

## Signals and Lit

Lit provides two signals integration packages: `@lit-labs/signals` for
integration with the TC39 Signals Proposal, and `@lit-labs/preact-signals` for
integration with Preact Signals.

Because the TC39 Signals Proposal promises to be the one signal API that
JavaScript systems converge on, we reccomend using it, and will focus on its
usage in this document.

### Installation

Install `@lit-labs/signals` from npm:

```sh
npm i @lit-labs/signals
```

### Usage

`@lit-labs/signals` provides three main exports:

- The `SignalWatcher` mixin to apply to all classes using signals
- The `watch()` template directive to watch individual signals with pinpoint
  updates
- The `html` template tag, and `withWatch()` template tag factory, to apply the
  watch directive automatically to template bindings.

`@lit-labs/signals` also exports some of the signals API for convenience.

Import these like so:

```ts
import {SignalWatcher, watch, signal} from '@lit-labs/signals';
```

#### Auto-watching with SignalWatcher

This simplest way to use signals is to apply the `SignalWatcher` mixins and
read and write any signals from withing the Lit lifecycle, such as in the
`render()` method.

In this example, the `SharedCounterComponent` reads and writes to a shared
signal. Every instance on the component will show the same value, and they will
all update when the value changes.

<!--
  TODO (justinfagnani): Make this an editable sample when the @lit-labs/signals
  package is published.
-->

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher, signal} from '@lit-labs/signals';

const count = signal(0);

@customElement('shared-counter')
export class SharedCounterComponent extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <p>The count is ${count.get()}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}
```

```html
<!-- Both of these elements will show the same counter value -->
<shared-counter></shared-counter>
<shared-counter></shared-counter>
```

#### Pinpoint Updates with `watch()`

Signals can be used to acheive more targeted, "pinpoint", DOM updates than a
full Lit component re-render. To do this we need to watch signals individually
with the `watch()` directive.

DOM updates performed by the `watch()` directive are batched and still use the
Lit reactive update lifecycle, but when the current Lit update has only been
triggered by `watch()` directives, the full template render is skipped and only
the directives with changed signals have their DOM updated.

This examples is the same as the previous, but only the DOM controlled by the
`${watch(count)}` binding is updated when the `count` signal changes:

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher, watch, signal} from '@lit-labs/signals';

const count = signal(0);

@customElement('shared-counter')
export class SharedCounterComponent extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <p>The count is ${watch(count)}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }

  #onClick() {
    count.set(count.get() + 1);
  }
}
```

In most cases `watch()` will _not_ be a significant performance improvement over
plain Lit template renders. This is because Lit already only updates the DOM
for bindings that have changed values.

In this example, the work skipped by a pinpoint update is the identity check
for the template returned by `render()` and the value check for the `@click`
binding, both of which are cheap.

The performance savings of `watch()` will tend to scale with the amount of
template logic and the number of bindings that can be skipped in an update, so
this will be more significant in templates with lots of logic and bindings.

> [!NOTE]
>
> <!-- keep Prettier at bay -->
>
> `@lit-labs/signals` does not contain a signal-aware `repeat()` directive yet.
> Changes to the contents arrays will perform a full render until then.

#### Auto-pinpoint updates with the signals `html` template tag

`@lit-labs/signals` also exports an `html` template tag that will apply the
`watch()` directive automatically to any signal value passed to a binding.

This can be convenient to avoid the extra characters of the `watch()` directive
or the `signal.get()` calls required without `watch()`.

If you import `html` from `@lit-labs/signals` instead of from `lit`, you will
get the auto-watching feature:

```ts
import {LitElement} from 'lit';
import {SignalWatcher, html, signal} from '@lit-labs/signals';

// SharedCounterComponent ...
  render() {
    return html`
      <p>The count is ${count}</p>
      <button @click=${this.#onClick}>Increment</button>
    `;
  }
```

## Ensuring proper polyfill installation

`@lit-labs/signals` depends on the `signal-polyfill` package, so you don't need
to install anything else to start using signals.

But since signals rely on a shared global data structure (the signal dependency
graph), it's critically important that the polyfill is installed properly -
there can be only one copy of the polyfill package in any page or app.

If more than one copy of the polyfill is installed (either because of
incompatible versions or other npm mishaps) then it's possible to _partition_
the signal graph so that some watchers will not work with some signals, or some
signals will not be tracked as dependencies of others.

To prevent this, be sure to check that there's only one installation of
`signal-polyfill`, using the `npm ls` command:

```sh
npm ls signal-polyfill
```

If you see more than one listing for `signal-polyfill` _without_ `deduped` next
to the line, then you have duplicate copies of the polyfill.

You can usually fix this by running:

```sh
npm dedupe
```

If that doesn't work you may have to update dependencies until you get a single
compatible version of `signal-polyfill` across your package installation.

## Missing Features

`@lit-labs/signals` is not feature-complete. There are a few envisioned features
that will make working with signals in Lit more viable and performant:

- [ ] A signal-aware `repeat()` directive. This will make incremental updates to
      arrays more efficient.
- [ ] A `@property()` decorator that uses signals for storage, to unify reactive
      properties and signals. This will make it easier to use generic signal
      utilities with Lit reactive properties.
- [ ] A `@computed()` decorator for marking methods as computed signals. Since
      computed signals are memoized, this can help with expensive computations.
- [ ] An `@effect()` decorator for marking methods as effects. This can be a
      more ergonomic way of running effects than using a separate utility.

## Useful Resources

### `signal-utils`

The `signal-utils` npm package contains a number of utilities working with the
TC39 Signals Proposal, including:

- Signal-backed, observable, collections like Array, Map, Set, WeakMap, WeakSet,
  and Object.
- Decorators for building classes with signal-backed fields.
- Effects and reactions

The collections and decorators are useful for building observable data models
from signals, where you will often need to manage values more complicated than
a primitive.

#### Collections

For instance, you can make an observable array:

```ts
import { SignalArray } from 'signal-utils/array';

const numbers = new SignalArray([1, 2, 3]);
```

Reading from the array, like iterating over it or reading `.length` will be
tracked as signal access, and mutations of the array, like from `.push()` or
`.pop()`, will notify any watchers.

#### Decorators

The decorators let you model a class with observable fields, much like a
`LitElement`:

```ts
import {signal} from 'signal-utils';

class GameState {
  @signal
  accessor playerOneTotal = 0;

  @signal
  accessor playerTwoTotal = 0;

  @signal
  accessor over = false;

  readonly rounds = new SignalArray();

  recordRound(playerOneScore, playerTwoScore) {
    this.playerOneTotal += playerOneScore;
    this.playerTwoTotal += playerTwoScore;
    this.rounds.push([playerOneScore, playerTwoScore]);
  }  
}
```

Instances of this `GameState` class will be tracked by SignalWatcher classes
that access it, and will update when the game state changes.

## Status and Feedback

This package is part of the Lit Labs family of experimental packages and under
active development. There may be missing features, serious bugs in the
implementation, and more frequent breaking changes than with the core Lit
libraries.

This package also relies on a proposal and polyfill that themselves are not
stable. As the signals proproposal progresses, breaking changes may be made to
the proposed API, which will then be made to the polyfill.

We encourage cautious use in order for us to gain experience with and get
feedback on the Lit integration layer, but please manage dependencies carefully
and test judiciously so that unexpected breaking changes are kept to a minimum.

Please leave feedback on the [@lit-labs/signals feedback
discussion](https://github.com/lit/lit/discussions/4779), and [file any
issues](https://github.com/lit/lit/issues) you encounter.

Feedback on the Signals proposal can be left on the [Signals proposal
repository](https://github.com/tc39/proposal-signals). Issues with the polyfill
can be filed [here](https://github.com/proposal-signals/signal-polyfill).