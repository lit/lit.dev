---
title: Lit for Polymer users
publishDate: 2022-08-22
lastUpdated: 2022-08-22
summary: Moving your code from Polymer to Lit.
thumbnail: /images/articles/lit_for_polymer_users
tags:
  - web-components
eleventyNavigation:
  parent: Articles
  key: Lit for Polymer users
  order: 0
author:
  - arthur-evans
---

Lit is a successor to the Polymer library. If you have a project built with Polymer and want to migrate it to Lit, or if you're familiar with Polymer and want to know how it compares to Lit, this is the right document for you.

This document provides a quick overview of how Lit relates to Polymer, and provides a cookbook showing how common Polymer code translates into Lit.

## How does Lit relate to Polymer?

Polymer was one of the first libraries for building web components. Lit is a successor to Polymer, built by the same team and with many of the same aims. The projects share many goals, but Lit takes advantage of lessons learned during the development of Polymer.

Because Polymer is the predecessor to Lit, there are a lot of similarities between the two. Both libraries make it easy to build components that work like built-in HTML elements, and both feature declarative HTML templates.

Lit differs from Polymer in several ways:

*   **Lit's rendering is asynchronous and batched by default.** With a few exceptions, all Polymer updates are synchronous.

*   **Lit exposes an update lifecycle that provides a powerful mechanism for observing changes to properties and computing derived values from them.** Polymer has declarative observers and computed properties, but it can be hard to predict the order in which observers will run.

*   **Lit focuses on JavaScript-first authoring, using native JavaScript modules.** Polymer  _originally_ focused on HTML-first authoring, made possible by the HTML Imports specification, which has since been removed from the web platform.

*   **Lit expressions use standard JavaScript.**  Polymer uses a limited domain-specific language in its bindings. Because Lit uses standard JavaScript, you can also use JavaScript for control flow inside expressions (conditional templates and repeated templates), where Polymer uses specialized helper elements.

*   **Lit aims for a simple, understandable mental model with unidirectional data flow.** Polymer supports two-way data binding and observers, which can be very nice in simple projects, but tend to make it harder to reason about data flow as the project gets more complex.


## Migrating from Polymer to Lit { #migrating }

If you're planning on migrating from Polymer to Lit, you don't have to do it all at once. Polymer and Lit work together, so you can migrate one component at a time.

There are a few things you'll want to do to update your project before you start working with Lit:

*   Update your project to Polymer 3.

*   Make sure your project tooling supports newer JavaScript features.

*   Remove two-way binding.

### Updating to Polymer 3

Polymer 2.x and earlier use HTML imports, which have since been removed from the web platform. Polymer 3 and Lit are both distributed as JavaScript modules, which means they work together well, and can take advantage of a wide range of modern web tooling.

In most cases, most of the migration process can be automated using the Polymer modulizer tool. For more information, see the [Polymer 3.0 upgrade guide](https://polymer-library.polymer-project.org/3.0/docs/upgrade).


### Language support

Polymer used features from the ECMAScript 2015 version of the JavaScript spec. If you started from one of the Polymer starter kits, your toolchain may not support newer JavaScript.

Lit uses features from ECMAScript 2019 (and some Lit example code may include newer language features). You'll need to update your tools if they don't handle these newer JavaScript features. For example:

*   Public instance fields and public static fields. These are widely used in the example code:

    ```js
    static styles = [ css`:host { display: block; }` ];
    ```

*   Async and await, which can be used to simplify promise-based code. For example:

    ```js
    async _loginClickHandler() {
      this.loggedIn = true;
      // Wait for `loggedIn` state to be rendered to the DOM
      await this.updateComplete;
      this.dispatchEvent(new Event('login'));
    }
    ```

For more information on language requirements for Lit, see [Requirements](https://lit.dev/docs/tools/requirements/).


### Removing two-way bindings { #removing-two-way-bindings }

Polymer's two-way binding effectively tightly couples a host property with a child property. This tight coupling creates a number of issues, so the team chose not to add two-way binding to Lit.

Removing two-way bindings **before** migrating to Lit will reduce the complexity of your migration, and let you test your application in Polymer without two-way bindings before starting your migration.

If your application doesn't use two-way binding, you can skip this section.


#### Issues with two-way binding

For two-way bindings, Polymer uses its own protocol, which has three main components:

*   A binding from host to child.

*   An event listener that handles property change events from the child element.

*   A facility for the child to automatically fire change events when properties change (`notify: true`).

This last item is the most problematic. Components fire change events for any change to a property, and each change event is handled synchronously.  Widespread use of two-way binding across an entire application can make it hard to reason about data flow and the order in which components update themselves.

Ideally an event is a discrete signal sent to communicate an explicit change that isn't otherwise easily observable. Sending an event as a side-effect of setting a property—as Polymer does—makes the communication potentially redundant and implicit. This implicit behavior, in particular, can make data flow hard to understand.

To summarize the [Custom Element Best Practices](https://web.dev/custom-elements-best-practices/#events) guidelines, a component **should** fire events:

*   When the state of the element changes as a result of user interaction—like clicking a button or editing a text field inside the component.

*   When something internal changes inside the component—like a timer going off or an animation completing.

Ideally, a component should fire _semantic_ events, which describe what changed rather than letting low-level UI events bubble out. For example, a form that lets the user update profile data might fire a `profile-updated` event when the user clicks the **Done** button. The `profile-updated` event is relevant to the parent: the click event isn't.


#### Replacing two-way bindings

There are many ways to replace two-way bindings. If you're just looking to migrate an existing Polymer application to Lit, you may just want to replace the two-way bindings with code that serves a similar function:

*   Remove the automatic property change event (`notify: true`).

*   Replace the automatic property change event with a more intentional change event.

*   Replace the two-way binding annotation with a one-way binding and an event handler. (This step is optional, but makes the transition to Lit simpler.)

For example, if the child is updating a notifying property because of a user interaction, remove the `notify: true` and fire the event change event manually, based on the user interaction event.

Consider the following Polymer code:

```js
static get properties() {
  return {
    name: {
      type: String,
      notify: true
    }
  };
}

static get template() {
  return html`
    Name: [[name]]<br>
    Enter name: <input value={{ '{{' }}name::input}}>
  `;
}
```

This component uses two-way binding to the `input` element, and has a notifying property, so a parent element can use two-way binding with the `name` property. The two-way binding to the input makes sense since the binding is set only when the `input` event fires. However, by adding an event listener for the `input` event, you can eliminate the notifying property:

```js
static properties = {
  name: {
    type: String,
  }
}

static get template() {
  return html`
    Name: [[name]]<br>
    Enter name: <input on-input="inputChanged" value=[[name]]>
  `;
}

inputChanged(e) {
  this.name = e.target.value;
  const propChangeEvent = new CustomEvent('name-changed', {
    detail: { value: this.name }
  });
  this.dispatchEvent(propChangeEvent);
}
```

This code explicitly listens for input events and fires `name-changed` events. This code will work with a parent that expects the Polymer two-way binding protocol, so you can update components one at a time.

This code won't fire a property change event when the parent sets the `name` property—which is a good thing. And you can migrate this code fairly directly to Lit.

Using an event handler like this, you could also add logic to the child component—such as only firing the `name-changed` event when the user stops typing for a certain interval.

{% aside "info" %}

One-way data flow.

Another alternative is to replace two-way bindings with a unidirectional data flow pattern, using a state container like Redux. Individual components can subscribe for updates to the state, and dispatch actions to update the state. We recommend this for new development, but it may require more work if you already have an application based on two-way bindings.

{% endaside %}

## Polymer to Lit cookbook

This section shows how Polymer code handles common tasks, and shows the equivalent Lit code. This can be helpful if you're already familiar with Polymer and want to learn Lit; or if you're migrating an existing project from Polymer to Lit.

This section assumes that you're using Polymer 3.0. If you're migrating a project from Polymer to Lit, you'll want to [migrate to Polymer 3.0](https://polymer-library.polymer-project.org/3.0/docs/upgrade) first.

For more information specific to migrating an existing project, see [Migrating from Polymer to Lit](#migrating).

{% aside "info" %}

JavaScript or TypeScript?

Lit works well with either. Most Lit examples are shown using switchable code sample widget, so you can select either TypeScript or JavaScript syntax.

{% endaside %}

### Defining a component

Both Polymer and Lit are based on web components, so defining a component looks very similar in both libraries. In the simplest case, the only difference is the base class.

Polymer:

```js
import {PolymerElement} from '@polymer/polymer/polymer-element.js';

export class MyElement extends PolymerElement { /* ... */ }
customElements.define('my-element', MyElement);
```

Lit:

{% switchable-sample %}

```ts
import {LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement { /* ... */  }
```

```js
import {LitElement} from 'lit';

export class MyElement extends LitElement { /* ... */  }
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}


#### About decorators { #about-decorators }

Lit provides an a set of decorators that can improve your developer experience—like the `customElement` shown in the TypeScript example in the previous section. Note that the TypeScript samples on this site include decorators, while the JavaScript samples omit them, but you can actually use JavaScript **with** decorators or use TypeScript **without** decorators. It's up to you. Using decorators in JavaScript requires a compiler like Babel. (Since you already need a compiler for TypeScript, you just need to configure it to process decorators.) For more information, see [Decorators](/docs/components/decorators/).


### DOM template

Both Polymer 3 and Lit provide an `html` tag function for defining templates.

Polymer:

```js
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';

export class MyElement extends PolymerElement {
  static get template() {
    return html`<b>Hello</b>`;
  }
}
customElements.define('my-element', MyElement);
```

Lit:

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`<b>Hello</b>`;
  }
}
```

```js
import {LitElement, html} from 'lit';

export class MyElement extends LitElement {
  render() {
    return html`<b>Hello</b>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

Note that Lit's `html` is different from Polymer's `html`. They have the same basic purpose, but they work differently. Polymer's `html` is called once during element initialization. Lit's `html` is usually called during each update. Setup work is performed once per template literal string, so subsequent calls to Lit's `html` function for incremental updates are very fast.

For more information on Lit templates, see [Templates overview](/docs/templates/overview/).


### Styles

Polymer components usually include styles directly in the template.

```js
static get template() {
  return html`
    <style>
      .fancy { color: blue; }
    </style>
    ...
  `;
}
```

In Lit, you _typically_ provide styles in a static `styles` field using the `css` tag function.

```js
import {LitElement, css, html} from 'lit';
  ...

  static styles = css`.fancy { color: blue; }`;
```

Adding a style tag directly in the template, like you would in Polymer, is also supported:

```js
import {LitElement, html} from 'lit';
  ...
  render() {
    return html`
      <style>
        .fancy { color: blue; }
      </style>
      ...
  }
```

Using a style tag may be slightly less performant than the static `styles` field, because the styles are evaluated once per instance instead of once per class.

For more information, see [Styles](/docs/components/styles/).


### Data binding

Where Polymer has data binding, Lit has _expressions_ in its templates. Lit expressions are standard JavaScript expressions that are bound to a particular location in the template. As such, Lit expressions can do almost everything you can do with Polymer data bindings, and many things that you can't easily do in Polymer.

{% aside "info" %}

Two-way bindings.

 The Lit team made an intentional choice not to implement two-way data bindings. While this feature seems to simplify some common needs, in practice it makes it hard to reason about data flow and the order in which components update themselves. We recommend removing two-way binding before migrating to Lit. For more information, see [Removing two-way bindings](#removing-two-way-bindings).

{% endaside %}

Polymer:

```js
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class UserView extends PolymerElement {
  static get properties() {
    return {
      name: String
    };
  }

  static get template() {
    return html`
      <div>[[name]]</div>
    `;
  }
}
```

Lit:

{% switchable-sample %}

```ts
import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

class UserView extends LitElement {

  @property()
  name: string;

  render() {
    return html`
      <div>${this.name}</div>
    `;
  }
}
```

```js
import {html, LitElement} from 'lit';

class UserView extends LitElement {

  static properties = {
    name: {}
  }

  render() {
    return html`
      <div>${this.name}</div>
    `;
  }
}
```

{% endswitchable-sample %}

As you can see, the main difference is replacing the double brackets around the polymer binding:

<code>[[<var>expression</var>]]</code>

with the expression syntax for a tagged template literal:

<code>${<var>expression</var>}</code>

Also, note that the Lit expression uses `this.name` instead of just `name.` Polymer bindings only allow certain things inside the binding annotation, such as a property name or path (such as `user.id`, or `shapes[4].type`). Property names or paths are evaluated relative to the current [binding scope](https://polymer-library.polymer-project.org/3.0/docs/devguide/data-system#data-binding-scope).

You can use any standard JavaScript expression in Lit, and standard JavaScript scopes apply. For example, you can access local variables created inside the `render()` method, or access instance variables  using `this`.

```js
render() {
  let count = this.getMatchingItems(this.pattern);

  return html`You have ${count} matches.`
}
```

Like Polymer, Lit supports setting properties, attributes, and event handlers using expressions. Lit uses slightly different syntax, with prefixes instead of suffixes. The following table summarizes the differences between Polymer and Lit binding syntax:


<table class="wide-table">
<thead>
<tr>
<th>
Type
</th>
<th>
Polymer
</th>
<th>
Lit
</th>
</tr>
</thead>
<tbody>
<tr>
<td>
Property
</td>
<td class="code-cell">
<code><var>property-name</var><strong>=[[</strong><var>value</var><strong>]]</strong></code>
</td>
<td class="code-cell">
<code><strong>.</strong><var>propertyName</var><strong>=${</strong><var>value</var><strong>}</strong></code>
</td>
</tr>
<tr>
<td>
Attribute
</td>
<td class="code-cell">
<code><var>attribute-name</var><strong>$=[[</strong><var>value</var><strong>]]</strong></code>
</td>
<td class="code-cell">
<code><strong></strong><var>attribute-name</var><strong>=${</strong><var>value</var><strong>}</strong></code>
</td>
</tr>
<tr>
<td>
Boolean attribute
</td>
<td class="code-cell">
<code><var>attribute-name</var><strong>?=[[</strong><var>value</var><strong>]]</strong></code>
</td>
<td class="code-cell">
<code><strong>?</strong><var>attribute-name</var><strong>=${</strong><var>value</var><strong>}</strong></code>
</td>
</tr>
<tr>
<td>
Event
</td>
<td class="code-cell">
<code><strong>on-</strong><var>event-name</var><strong>$=[[</strong><var>handler</var><strong>]]</strong></code>
</td>
<td class="code-cell">
<code><strong>@</strong><var>event-name</var><strong>=${</strong><var>handler</var><strong>}</strong></code>
</td>
</tr>
</tbody>
</table>

Notes:

* Property expressions. Lit uses the literal property name, prefixed with a period. Polymer uses the corresponding <a href="https://polymer-library.polymer-project.org/3.0/docs/devguide/properties#property-name-mapping">attribute name</a>.

* Event handlers. In Lit, the handler can be either a method, like `${this.clickHandler}` or an arrow function. Using an arrow function, you can close over other data or call a function with a different signature. For example:

    ```html
    <input @change=${(e) => this.setValue(e.target.value)}>
    ```

For more information, see [Expressions](https://lit.dev/docs/templates/expressions/).


### Two-way bindings

In general, we recommend removing two-way bindings before migrating Polymer projects to Lit. For more information, see [Removing two-way binding](#removing-two-way-bindings).

If you've replaced your two-way bindings with one-way bindings and event listeners, you should be able to migrate them fairly directly to Lit.

If you're writing a Lit component to replace a parent component that used to use two-way binding to communicate with a Polymer child component, add a property expression to set the property, and an event listener to handle the `property-changed` event.


Polymer:

```js
static get template() {
  return html`
    <polymer-child
      childprop="[[parentprop]]"
      on-childprop-changed="childpropChanged">
    </polymer-child>
  `;
}

childpropChanged(e) {
  this.parentprop = e.detail.value;
}
```

Lit:


```js
static template = html`
  <polymer-child
    .childprop=${this.parentprop}
    @childprop-changed=${(e) => this.parentprop = e.detail.value}>
  </polymer-child>
`;
```


#### Conditional templates

Polymer supports conditionals using the `dom-if` helper element.

```html
<template is="dom-if" if="{{condition}}">
  <div>condition is true</div>
</template>
```

In Lit, you can use a JavaScript conditional expressions. The conditional operator (or ternary) works well:

```js
html`${this.condition
    ?  html`<div>condition is true</div>`
    : ''
}`;
```

Unlike the Polymer `dom-if`, the conditional operator lets you supply content for both true and false conditions, although you can also return the empty string to render nothing, as in the example.

For more information, see [Conditionals](https://lit.dev/docs/templates/conditionals/).


#### Hiding or recreating DOM

By default, Polymer's `dom-if` behaves a little differently from a Lit conditional. When the condition goes from a truthy to a falsy value, the `dom-if` simply _hides_ the conditional DOM, instead of removing it from the DOM tree. This may save some resources when the condition becomes truthy again.

When migrating a Polymer `dom-if` to Lit, you have several choices:


- Use a simple JavaScript conditional. Lit removes and discards the conditional DOM when a condition changes to falsy. `dom-if` does the same thing if you set the `restamp` property to `true`.

- Use the standard `hidden` attribute to hide the content without removing it from the page.

    ```html
    <header hidden=${this.headerHidden}>
    ```

  This is quite lightweight. However, the DOM is created on first render even if the condition is false.

- Wrap a conditional in the `cache` directive to avoid discarding and re-creating the DOM when the condition changes.

In most cases, the simple conditional works well. If the conditional DOM is large and complex and you observe delays recreating the DOM when the condition switches to true, you can use Lit's `cache` directive to preserve the conditional DOM. When using `cache`, the DOM is still removed from the tree, but is cached in memory, which can save resources when the condition changes.

```js
import {LitElement, html} from 'lit';
import {cache} from 'lit/directives/cache.js';
...

   return html`${cache(this.condition
    ?  html`<div>condition is true</div>`
    : ''
   )}`;
```

Since this won't render anything when the condition is falsy, you can use it to avoid creating a complex piece of DOM on initial page load.

#### Repeating templates

Polymer uses the `dom-repeat` helper for repeating templates.

```html
<template is="dom-repeat" items="{{items}}">
  <li>{{item.name}}</li>
</template>
```
The template inside the `dom-repeat` can access a limited set of properties: properties on the host element, plus the `item` and `index` properties added by the `dom-repeat`.

As with conditionals, Lit can handle repeats using JavaScript, by having an expression return an array of values. Lit's `map` directive works like the `map()` array method, except that it accepts other kinds of iterables, like sets or generators.

```js

import {map} from 'lit/directives/map.js';
...
  render() {
    return html`
      <ul>
        ${map(this.items, (item) =>
          html`<li>${item.name}</li>`)
        }
      </ul>
    `;
  }
```

While Polymer bindings can only access certain properties, Lit expressions can access anything available in the JavaScript scope.

You can also generate an array in the `render()` method:

```js
render() {
  const itemTemplates = [];
  for (i of this.items) {
    itemTemplates.push(html`<li>${i}</li>`);
  }

  return html`
    <ul>
      ${itemTemplates}
    </ul>
  `;
}
```

For more information, see  [Lists](/docs/templates/lists/), or try our interactive tutorial on [working with lists](/tutorials/working-with-lists/).


##### Handling events from repeating templates

There are different ways to add event listeners to repeated elements:

*   If the event bubbles, you can use _event delegation_, adding a single listener to a parent element.

*   If the event doesn't bubble, you can add a listener to each repeated element.

For examples using both techniques, see [Listening to events fired from repeated elements](/docs/components/events/#listening-to-events-fired-from-repeated-templates) in the Events section.

When handling events from elements generated by repeating templates, you frequently need to identify both the element that fired the event, and the data that generated that element.

Polymer helps with the latter by [adding data to the event object](https://polymer-library.polymer-project.org/3.0/docs/devguide/templates#handling-events).

Lit doesn't add this extra data, but you can attach a unique value to each repeated element for ease of reference:

```js
render() {
  return html`
    <div @click=${this.handleClick}>
      ${map(this.items, (item) => {
        return html`<button data-id=${item.id}>${item.text}</button>`
      }
    </div>
  `;
}
```

When adding listeners to individual items, you can also use an arrow function to pass data directly to the event handler:

```js
render() {
  return html`
    <div>
      ${this.items.map((item) => {
          return html`<button
            @click=${() => this._handleClick(item)}>
            ${item.text}
          </button>`;
        }
       }
    </div>
  `;
}
```


### Properties

Lit's _[reactive properties](https://lit.dev/docs/components/properties/)_ are a fairly good match for Polymer's declared properties. Reactive properties support many of the same features as declared properties, including syncing values between the property and an attribute.

#### Configuring properties

Like Polymer, Lit lets you configure properties using a static `properties` field.

Lit also supports using the `@property` decorator to declare a reactive property. For more information, see [About decorators](#about-decorators).

Polymer:

```js
 static get properties() {
    return {
      user: String,
      count: {
        type: Number,
        notify: true
      }
    }
  }
```

Lit:

{% switchable-sample %}

```ts
@property()
user: string;

@property({type: Number})
count: number;
```

```js
static properties = {
  user: {},
  count: {
    type: Number
  }
}
```

{% endswitchable-sample %}


Both Polymer and Lit support a number of options when declaring a property. The following list shows the Polymer options and their Lit equivalents.

<dl class="params">
<dt class="paramName"><code>type</code></dt>
<dd class="paramDetails">

Lit's `type` option serves the same purpose.

</dd>

<dt class="paramName"><code>value</code></dt>
<dd class="paramDetails">

Lit doesn't support setting a property's value like this. Instead, set a default value in the constructor. If using the `@property` decorator, you can also use a class field initializer.

</dd>

<dt class="paramName"><code>reflectToAttribute</code></dt>
<dd class="paramDetails">

In Lit, this option has been shortened to `reflect`.

</dd>

<dt class="paramName"><code>readOnly</code></dt>
<dd class="paramDetails">

Lit doesn't include any built-in support for read-only reactive properties. If you need to make a calculated property part of a component's public API, you can add a getter with no setter.
</dd>


<dt class="paramName"><code>notify</code></dt>
<dd class="paramDetails">

This feature is used to support two-way binding. It was **not** implemented in Lit because of the issues described in [Issues with two-way binding](#issues-with-two-way-bidning). 

Lit components can use the native web APIs (such as `dispatchEvent`) to fire events in response to user input or when an internal state changes.

</dd>

<dt class="paramName"><code>computed</code></dt>
<dd class="paramDetails">

Declarative computed properties are not supported in Lit. See computed properties for alternatives.

</dd>

<dt class="paramName"><code>observer</code></dt>
<dd class="paramDetails">

Lit doesn't support observers directly. Instead, it supplies a number of override points in the lifecycle where you can take action based on any properties that have changed.'
</dd>
</dl>

#### Static getter versus static class field

Note that the Polymer example uses a getter—`static get properties()`—where the Lit JavaScript example uses a class field—`static properties`. These two forms work the same way. When Polymer 3 was published, support for class fields was not widespread, so Polymer example code uses the getter.

If you're adding Lit components to an existing Polymer application, your toolchain may not support the class field format. In which case, you can use the static getter, instead.

```js
static get properties() {`
  return {
    user: {},
    count: {
      type: Number
    }
  }
}
```


#### Array & object type properties

Like Polymer, Lit does dirty checking when properties change to avoid performing unnecessary work. This can lead to issues if you have a property that holds an object or array. If you mutate the object or array, Lit won't detect a change.

In most cases, the best way to avoid these issues is to use immutable data patterns, so that you always assign a new object or array value instead of mutating an existing object or array. The same is generally true for Polymer.

Polymer includes APIs for observably [setting subproperties](https://polymer-library.polymer-project.org/3.0/docs/devguide/model-data#set-path) and [mutating arrays](https://polymer-library.polymer-project.org/3.0/docs/devguide/model-data#array-mutation), but they are somewhat challenging to use properly. If you're using these APIs, you may need to migrate to an immutable data pattern.

For more information, see [Mutating object and array properties](https://lit.dev/docs/components/properties/#mutating-properties).


#### Read-only properties

Read-only properties were not a very commonly-used feature in Polymer, and they are not difficult to implement if needed, so they weren't included in the Lit API.

To expose an internal state value as part of the component's public API,  you can add a getter with no setter. You may also want to fire an event when the state changes (for example, a component that loads resources from the network may have a "loading" state and fire an event when that state changes).

Polymer's read-only properties include a hidden setter. You can add a private setter for your property if that makes sense for your component.

{% switchable-sample %}

```ts
private _name: string = 'Somebody';

@property({attribute: false})
get name() { return this._name; }

private _setName(name: string) {
  this._name = name;
  this.requestUpdate('name');
}
```

```js
static properties = {
  name: {attribute: false}
};

constructor() {
  super();
  this._name = 'Somebody';
}

get name() { return this._name }

_setName(name) {
  this._name = name;
  this.requestUpdate('name');
}
```

{% endswitchable-sample %}

Note that if the property isn't included in the component's template, you don't need to declare it  (with `@property` or `static properties`) or call `requestUpdate()`.


### Computed properties and observers

Lit provides a number of overridable lifecycle methods that are called when reactive properties change. Use these methods to implement logic that would go in computed properties or observers in Polymer.

The following lists summarize how to migrate different kinds of computed properties and observers.

Computed properties:

*   For values used ephemerally in the template, compute values as local variables in `render()` and use them in the template before returning.

*   For values that need to be stored persistently, or are expensive to compute, do so in `willUpdate()`.

*   Use the `changedProperties.has()` method to compute only when dependencies change, to avoid expensive re-computation every update.

Observers:

*   If the observer needs to act directly on DOM based on property changes, use `updated()`. This is called after the `render()` callback.

*   Otherwise, use `willUpdate()`.

*   In either case, use `changedProperties.has()` to know when a property has changed.

Path-based observers:

*   These are complex observers that observe paths like `foo.bar` or `foo.*`:

    ```js
    observers: ['fooBarChanged(foo.bar)', 'fooChanged(foo.*)']
    ```

*   This feature was very specific to Polymer's data system that has no equivalent in Lit.

*   We recommend using immutable patterns as a more interoperable way to communicate deep property changes. For more information, see [Mutating object and array properties](https://lit.dev/docs/components/properties/#mutating-properties).


#### Computing transient values in render()

If you need to calculate transient values that are only used for rendering, you can calculate them directly in the `render()` method.

Polymer:

```js
 static get template() {
    return html`
      <p>Text: <span>{{cyphertext}}</span></p>
    `;
  }

  static get properties() {
    return {
      /* ... */
      cyphertext: {
        type: String,
        computed: 'rot13(cleartext)'
      }
    }
  }
```

Lit:

```js
render() {
  const cyphertext = rot13(this.cleartext);
  return html`Text: ${cyphertext}`;
}
```

Also, because Lit allows you to use any JavaScript expression in a template, Polymer's [computed bindings](https://polymer-library.polymer-project.org/3.0/docs/devguide/data-binding#annotated-computed) can be replaced with inline expressions, including function calls.

Polymer:

```js
  static get template() {
    return html`
      My name is <span>[[_formatName(given, family)]]</span>
    `;
  }

```

Lit:

```js
render() {
  html`
      My name is <span>${this._formatName(given, family)}</span>
    `;
}
```

Since Lit expressions are plain JavaScript, you need to use `this` inside the expression to access an instance property or method.

#### Computing properties in willUpdate()

The `willUpdate()` callback is an ideal place to calculate properties based on other property values. `willUpdate()` receives a map of changed property values, so you can handle the current changes.

{% switchable-sample %}

```ts
  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('userId') || changedProperties.has('avatarId')) {
      this.imageUrl = this._getImageUrl(this.userId, this.avatarId);
    }
  }
```

```js
  willUpdate(changedProperties) {
    if (changedProperties.has('userId') || changedProperties.has('avatarId')) {
      this.imageUrl = this._getImageUrl(this.userId, this.avatarId);
    }
  }
```

{% endswitchable-sample %}

Using `willUpdate()` lets you choose what to do based on the complete set of changed properties. This avoids issues with multiple observers or computed properties interacting in unpredictable ways.

## Mixins

Mixins were one of several ways to package reusable functionality for use in a Polymer component. If you're porting a Polymer mixin to Lit, you have several options.

*   **Standalone functions**. Because Polymer's data bindings can only access instance members, people often created a mixin simply to make a function available in a data binding. This isn't required in Lit, since you can use any JavaScript expression in your template. Instead of using a mixin, you can import a function from another module and use it directly in your template.

*   **Lit mixins**. Lit mixins work much like Polymer mixins, so many Polymer mixins can be reimplemented as Lit mixins. For more information, see [Mixins](https://lit.dev/docs/composition/mixins/).

*   **Reactive controllers**. Reactive controllers are an alternate way to package reusable features. For more information comparing mixins to reactive controllers, see [Controllers and mixins](https://lit.dev/docs/composition/overview/#controllers-and-mixins)


## Lifecycle

Lit components have the same set of standard web components lifecycle callbacks as Polymer components.

In addition, Lit components have a set of callbacks that can be used to customize the [reactive update cycle](/docs/components/lifecycle/#reactive-update-cycle).

If you're using the `ready()` callback in your Polymer element, you may be able to use Lit's `firstUpdated()` callback for the same purpose. The `firstUpdated()` callback is invoked after the first time the component's DOM is rendered. You could use it, for example, if you want to focus an element in the rendered DOM.

```js
firstUpdated() {
 this.renderRoot.getElementById('my-text-area').focus();
}
```

For more information, see [Completing an update](/docs/components/lifecycle/#reactive-update-cycle-completing).
