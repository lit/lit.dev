---
title: The Lit Cheat Sheet
publishDate: 2024-05-10
lastUpdated: 2024-05-10
summary: A quick reference for the basics of Lit
thumbnail: /images/articles/lit_cheat_sheet
tags:
  - web-components
  - web-components
eleventyNavigation:
  parent: Articles
  key: The Lit Cheat Sheet
  order: 1
author:
  - elliott-marquez
preloadTsWorker: true
---

Do you need a quick reference for the basics of Lit? Look no further! This cheat
sheet will help you get started with, or just remember, the features of Lit.

If you are coming from another framework, you might also want to supplement this
article with [Component Party](https://component-party.dev/) which compares
basic concepts across different frameworks. Just make sure that Lit is selected
at the top of the page!

{% aside "positive" "no-header" %}

Use the Table of Contents to jump to a specific section!

{% endaside %}

## Component Definition

### Defining a Component

`LitElement` is the base class for all Lit components.

<ts-js><span slot="ts"><code>@customElement</code></span><span slot="js"><code>customElements.define</code></span></ts-js> is where you associate the name of your component with the class definition / logic of that component.

`render()` is the method where you define your component's template using a tagged template literal with `html`.

Write your HTML in the `html` tagged template literal.

{% playground-ide "articles/lit-cheat-sheet/define", true %}


{% aside "info" %}

Important rules:

Components are global HTML elements, you currently can't have more than one with the same name on a page.

Components must have dashes in their name (defined using <ts-js><span slot="ts"><code>@customElement</code></span><span slot="js"><code>customElements.define</code></span></ts-js>).

{% endaside %}


**Related Documentation & Topics:**

- [Defining a Component](/docs/components/defining/)
- [LitElement](/docs/api/LitElement/)
- [`@customElement`](/docs/api/decorators/#customElement)
- [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)
- [Rendering](/docs/components/rendering/)
- [How to build your first Lit component](https://www.youtube.com/watch?v=QBa1_QQnRcs) (Video)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s)

### Import a component

To use a component, import the file with it's definition.

{% playground-ide "articles/lit-cheat-sheet/import", true %}

**Related Documentation & Topics:**

- [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (external)
- [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) (external)
- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) (external)
- [`@customElement`](/docs/api/decorators/#customElement)
- [`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) (external)
- [Local dev servers (bare module specifiers)](/docs/tools/development/#devserver)

## Templating

### Render HTML

Use the `html` tagged template literal to define your component's template.

{% playground-ide "articles/lit-cheat-sheet/define", true %}

**Related Documentation & Topics:**

- [Templates Overview](/docs/templates/overview/)
- [Rendering](/docs/components/rendering/)

### Conditionals

Use standard JavaScript conditional expressions in your template to conditionally render content.

{% playground-ide "articles/lit-cheat-sheet/conditionals", true %}

**Related Documentation & Topics:**

- [Conditionals](/docs/templates/conditionals/)
- [Expressions](/docs/templates/expressions/)

### Attribute and Property Expressions (Binding syntax)

Lit-html has three types of built-in expressions to set attributes or properties on elements:

- Property expressions `.prop=${value}`
- Attribute expressions `attr=${value}`
- Boolean attribute expressions `?attr=${value}`

{% playground-ide "articles/lit-cheat-sheet/expressions", true %}

**Related Documentation & Topics:**

- [Expressions](/docs/templates/expressions/)
- [Expressions – Attribute Expressions](/docs/templates/expressions/#attribute-expressions)
- [Expressions – Property Expressions](/docs/templates/expressions/#property-expressions)

### Event Listener Expressions

Lit-html has a built-in event listener expression to add event listeners to elements.

{% playground-ide "articles/lit-cheat-sheet/event-listeners", true %}

**Related Documentation & Topics:**

- [Expressions](/docs/templates/expressions/)
- [Expressions – Event listener expressions](/docs/templates/expressions/#event-listener-expressions)
- [Events](/docs/components/events/)
- [Event communication between web components](https://www.youtube.com/watch?v=T9mxtnoy9Qw&themeRefresh=1) (video)
- [Customizing event listener options](/docs/components/events/#event-options-decorator)
- [A complete guide on shadow DOM and event propagation](https://pm.dartus.fr/posts/2021/shadow-dom-and-event-propagation/) (external)

### Rendering lists

Lit-html can render JavaScript arrays and iterables. For most simple use cases,
you can use the `Array.map()` method to render arrays of items or the `map()`
directive to render any other iterables. This pattern is best used for short,
simple lists.

{% playground-ide "articles/lit-cheat-sheet/render-lists", true %}

**Related Documentation & Topics:**

- [Lists](/docs/templates/lists/)
- [Working With Lists Tutorial](/tutorials/working-with-lists/)
- [Built-in directives – `map()`](/docs/templates/directives/#map)
- [Built-in directives – `range()`](/docs/templates/directives/#range)
- [Built-in directives – `join()`](/docs/templates/directives/#join)

### Re-rendering lists efficiently

For long lists that may change frequently, use the `repeat()` directive to efficiently re-render only the items that have changed.

{% playground-ide "articles/lit-cheat-sheet/repeat", true %}

- [Lists](/docs/templates/lists/)
- [Working With Lists Tutorial – The `repeat()` directive](/tutorials/working-with-lists/#6)
- [Built-in directives – `repeat()`](/docs/templates/directives/#repeat)

### Virtualizing long lists

For lists that are so long that it would be impractical to render all items at once, use the Lit Virtualizer to render only the items that are currently in view.

{% playground-ide "articles/lit-cheat-sheet/virtualizer", true %}

{% aside "labs" %}

Lit Virtualizer is in labs

meaning that its implementation might change until it has graduated and become stable. Additionally there are many more features to virtualizer, so it is recommended to look at the documentation.

{% endaside %}

**Related Documentation & Topics:**

- [Lit Virtualizer Documentation](https://github.com/lit/lit/tree/main/packages/labs/virtualizer#readme) (external)
- [Lit Labs: Virtualizer](https://www.youtube.com/watch?v=ay8ImAgO9ik) (video)

## Styles

### Add Styles

Add styles by defining the `static styles` property. Write CSS in the `css` tagged template literal.

{% playground-ide "articles/lit-cheat-sheet/add-styles", true %}

**Related Documentation & Topics:**

- [Styles](/docs/components/styles/)

### Styles are Scoped

Styles *only* apply to the current element. That means you can feel free to use super generic selectors that you'd normally have to make up class names for.

{% playground-ide "articles/lit-cheat-sheet/scope-styles", true %}

**Related Documentation & Topics:**

- [Styles](/docs/components/styles/)
- [Shadow DOM](/docs/components/shadow-dom/)

### Conditionally Add Classes

To conditionally apply styles it's generally best to use `classMap`.

{% playground-ide "articles/lit-cheat-sheet/classes", true %}

**Related Documentation & Topics:**

- [Defining Scoped Styles in the template](/docs/components/styles/#styles-in-the-template)
- [`classMap`](/docs/templates/directives/#classmap)
- [`classMap` tsdoc](/docs/api/directives/#classMap)
- [Playground example](/playground/#sample=examples/directive-class-map)


### Sharing Lit styles with imports

You can share Lit stylesheets with other components by exporting them from a module and importing them into another.

{% playground-ide "articles/lit-cheat-sheet/share-styles-import", true %}

- [Styling](/docs/components/styles/)
- [Sharing Styles](/docs/components/styles/#sharing-styles)

### Inheriting Styles Through Shadow DOM With CSS Custom Properties


CSS Custom Properties can pierce multiple shadow roots allowing you to share values for specific properties.

{% playground-ide "articles/lit-cheat-sheet/inheriting-custom-props", true %}

**Related Documentation & Topics:**

- [CSS Custom Properties](/docs/components/styles/#customprops)
- [Theming](/docs/components/styles/#theming)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (Video)

### Setting Arbitrary Styles With CSS Shadow Parts

CSS Shadow Parts are exposed by components with the `part="<part-name>"` attribute.

Shadow Parts can pierce individual shadow roots allowing you to set arbitrary styles on a given node using the `::part(<part-name>)` pseudo-element.

{% playground-ide "articles/lit-cheat-sheet/css-shadow-parts", true %}

**Related Documentation & Topics:**

- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (video)
- [CSS Shadow Parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) (external)
- [`::part`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) (external)

### Exporting a CSS Shadow Part

CSS Shadow part names can only apply to the targeted element. You need to use `exportparts` to expose a shadow part in nested shadow roots.

You can export multiple parts by separating them with a comma (`,`).

You can also rename parts with a colon (`:`).

{% playground-ide "articles/lit-cheat-sheet/export-part", true %}

**Related Documentation & Topics:**

- [`exportparts`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts) (external)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (video)
- [CSS Shadow Parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) (external)
- [`::part`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) (external)

## Shadow DOM

### What does Shadow DOM do?

- Scopes styles to the shadow root
- Scopes the DOM to the shadow root
  - Can't be targeted by querySelector calls from outside the shadow root
- Enables slotting content with the `<slot>` element
- Exposes an API for CSS with CSS Custom Properties and CSS Shadow Parts

**Related Documentation & Topics:**

- [DOM Encapsulation](/docs/components/rendering/#dom-encapsulation)
- [Working with Shadow DOM](/docs/components/shadow-dom/)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (video)

### Turn off Shadow DOM

You can turn off the Shadow DOM by overriding the `createRenderRoot()` method and setting the render root to the element itself.

{% playground-ide "articles/lit-cheat-sheet/turn-off-shadow-dom", true %}

{% aside "warn" %}

By turning off shadow DOM you lose the benefits of encapsulation, DOM scoping, and `<slot>` elements.

Since the Shadow root no longer exists, Lit will no longer handle the `static styles` property for you. You must must decide how to handle your styles.

{% endaside %}

**Related Documentation & Topics:**

- [Implementing `createRenderRoot()`](/docs/components/shadow-dom/#implementing-createrenderroot)

### Turning on `delegatesFocus` and other shadow root options

You can set shadow root options passed to `Element.attachShadow()` by overriding the static `shadowRootOptions` member.

{% playground-ide "articles/lit-cheat-sheet/shadow-root-options", true %}

**Related Documentation & Topics:**

- [Setting `shadowRootOptions`](/docs/components/shadow-dom/#setting-shadowrootoptions)
- [`Element.prototype.attachShadow():options`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options) (external)
- [`delegatesFocus`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus) (external)

## Properties and State

### Reactive Properties

Reactive properties are properties within a component that automatically trigger
a re-render when they change. These properties can be set externally, from
outside the component's boundary.

They also handle attributes by accepting them and converting them into
corresponding properties.

You can define a reactive property with the <ts-js><span slot="ts"><code>@property</code> decorator</span><span slot="js"><code>static properties = { propertyName: {...}}</code> code block and initializing them in the <code>constructor()</code></span></ts-js>.


{% playground-ide "articles/lit-cheat-sheet/reactive-properties", true %}

**Related Documentation & Topics:**

- [Reactive Properties](/docs/components/properties/)
- [Public reactive properties](/docs/components/properties/#declare)
- [Attributes](/docs/components/properties/#attributes)
- [Custom property accessors](/docs/components/properties/#attributes)
- [Customizing change detection](/docs/components/properties/#haschanged)
- [Reactivity Tutorial](/tutorials/reactivity/)
- [Custom Attribute Converters Tutorial](/tutorials/custom-attribute-converter/)
- [What Are Elements Video](https://www.youtube.com/watch?v=x_mixcGEia4)
- [Introduction to Lit - Reactive Properties Video](https://www.youtube.com/watch?v=uzFakwHaSmw&t=576s)

### Reactive State

Reactive state is a property that is private to the component and is not exposed
to the outside world. These properties are used to store internal state of a
component that should trigger a re-render of the Lit lifecycle when they change.

You can define a reactive property with the <ts-js><span slot="ts"><code>@state</code> decorator</span><span slot="js"><code>static properties = { propertyName: {state: true, ...}}</code> code block and setting the <code>state: true</code> flag in the property's info. You can initialize them in the <code>constructor()</code></span></ts-js>.

{% playground-ide "articles/lit-cheat-sheet/reactive-state", true %}

**Related Documentation & Topics:**

- [Reactive Properties](/docs/components/properties/)
- [Internal Reactive State](/docs/components/properties/#internal-reactive-state)
- [Customizing change detection](/docs/components/properties/#haschanged)
- [Reactivity Tutorial](/tutorials/reactivity/)
- [What Are Elements Video](https://www.youtube.com/watch?v=x_mixcGEia4)
- [Introduction to Lit - Reactive Properties Video](https://www.youtube.com/watch?v=uzFakwHaSmw&t=576s)

### Re-render an Array or Object Change

Arrays are objects in JavaScript, and Lit's default change detection uses strict
equality to determine if an array has changed. If you need to re-render a
component when an array is mutated with something like `.push()` or `.pop()`,
you will need to let Lit know that the array has changed.

The most common ways to do this are:

- Use the `requestUpdate()` method to manually trigger a re-render
- Create a new array / object reference

{% playground-ide "articles/lit-cheat-sheet/rerender-array-change", true %}

{% aside "warn" %}

Custom `hasChanged()` methods in the reactive property definition won't help
much here.

The `hasChanged()` function is only called when the property is set, not when
the property is mutated. This would only be helpful when an array or object has
a new reference assigned to it and you _don't_ want to trigger a re-render.

If this is your use case, you might generally be better off using a [`repeat()`
directive](#re-rendering-lists-efficiently).

{% endaside %}

**Related Documentation & Topics:**

- [Lifecycle - Triggering an update](/docs/components/lifecycle/#reactive-update-cycle-triggering)
- [Rendering Arrays](/docs/templates/lists/#rendering-arrays)
- [Reactivity Tutorial - Triggerin an update](/tutorials/reactivity/#3)
- [Working With Lists Tutorial](/tutorials/working-with-lists/)

### Custom Attribute Converters

In advanced cases, you may need to convert an attribute value to a property in
a special way and vice versa. You can do this with a custom attribute converter.

{% playground-ide "articles/lit-cheat-sheet/custom-attribute-converter", true %}

**Related Documentation & Topics:**

- [Reactive properties - Providing a custom converter](/docs/components/properties/#conversion-converter)
- [Reactive properties - Using the default converter](/docs/components/properties/#conversion-type)
- [Attributes](/docs/components/properties/#attributes)
- [Custom Attribute Converters Tutorial](/tutorials/custom-attribute-converter/)
- [Reactive Properties](/docs/components/properties/)
- [Public reactive properties](/docs/components/properties/#declare)
- [Custom attribute converter snippet](/playground/#sample=examples/properties-custom-converter)

### Context

If you need to pass data down to a subtree without using properties or "prop
drilling", you might want to use
[`@lit/context`](https://www.npmjs.com/package/@lit/context).

{% playground-ide "examples/context-consume-provide", true %}

**Related Documentation & Topics:**

- [Context](/docs/data/context/)
- [WCCG Context Community Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) (external)

## Lifecycle

### Lifecycle order

There are two lifecycles in Lit, the native Web Component lifecycle and the
lifecycle that Lit adds on top of it to help handle property and state changes.

There are more lifecycle events which can be
[found in the documentation](/docs/components/lifecycle/#reactive-update-cycle),
but the ones you would normally use are the following and this is their general
order:

1. `constructor` – (Native custom element lifecycle)
2. `connectedCallback` – (Native)
3. `willUpdate` – (Lit lifecycle)
4. `update` – (Lit)
5. `render` – (Lit)
6. `firstUpdated` – (Lit)
7. `updated` – (Lit)
8. `disconnectedCallback` – (Native)

{% aside "warn" %}

The Lit lifecycle and the native custom element lifecycle are distinct and managed separately.

While they generally follow a specific order, they may intermix because the
browser controls the native lifecycle, while Lit and JavaScript manage the Lit
lifecycle.

For example, a component may be attached to the DOM and then removed before the
Lit lifecycle may run at all, or a component may be created with
`document.createElement` which would call the `constructor`, but if it's never
added to the DOM, the `connectedCallback` would never run and thus the Lit
lifecycle would never run.

{% endaside %}

**Related Documentation & Topics:**

- [Lifecycle](/docs/components/lifecycle/)
- [Lifecycle diagram](/docs/components/lifecycle/#reactive-update-cycle)

#### `constructor`

- Runs when the element is created via:
  - `document.createElement('my-element')`
  - `element.innerHTML = '<my-element></my-element>'`
  - `new MyElement()`
  - etc.
- A good place to set initial properties
- Do **NOT** require parameters in the constructor or modify DOM

#### `connectedCallback`

- *May* run on the server. This has not been finalized.
- Runs when the element is added to the DOM via:
  - `element.appendChild(element)`
  - `element.innerHTML = '<my-element></my-element>'`
  - etc.
- Can run multiple times, but a good spot to set up event listeners

#### `willUpdate`

- Runs on the server – do **NOT** access the DOM or browser APIs
- A good place to set up properties that depend on other properties

#### `update`

- A good place to update properties that depend on other properties that depend on DOM

#### `render`

- Runs on the server - do NOT access the DOM or browser APIs

#### `firstUpdated`

- Runs after the first render
- A good place to do some initializations that require the copmonent's rendered
  DOM

#### `updated`

- A good place to do some updates that require the component's rendered DOM or
  to update properties that depend on the rendered DOM
- Try to avoid setting reactive properties in this lifecycle as it may cause
  unnecessary renders. Try to do them in `willUpdate` or `update` if possible.

#### `disconnectedCallback`

- Is called *AFTER* the element is removed from the DOM
- A good place to clean up event listeners

### Waiting for an update

All Lit elements have asynchronous lifecycles. You need to wait for the `updateComplete` promise to resolve before you can be sure that the element has finished updating its DOM.

{% playground-ide "articles/lit-cheat-sheet/update-complete", true %}

**Related Documentation & Topics:**

- [Lifecycle](/docs/components/lifecycle/)
- [updateComplete()](/docs/components/lifecycle/#updatecomplete)
- [requestUpdate()](/docs/components/lifecycle/#requestUpdate)

## Events

### Adding listeners to host element or globally

A common pattern is to add event listeners to the host element or globally in the `connectedCallback` and remove them in the `disconnectedCallback`.

{% playground-ide "articles/lit-cheat-sheet/host-global-listeners", true %}

**Related Documentation & Topics:**

- [Lifecycle](/docs/components/lifecycle/)
- [Events](/docs/components/events/)
- [Authoring components for Lit SSR](/docs/ssr/authoring/)
- [A complete guide on shadow DOM and event propagation](https://pm.dartus.fr/posts/2021/shadow-dom-and-event-propagation/) (external)

## Data Flow and State Management

### Pass data down

The simplest way to pass data down is to use properties and attributes.

For example, you can pass data down to child components using property bindings like this:

`.name=${'Steven'}`

For boolean properties, use a question mark instead of a period, like this:

`?programmer=${true}`.

You generally want to expose you component's external attribute and property API with <ts-js><span slot="ts"><code>@property()</code> instead of <code>@state()</code></span><span slot="js"><code>static properties = {propName: {state: false}}</code></span></ts-js>.

{% playground-ide "articles/lit-cheat-sheet/pass-data-down", true %}

**Related Documentation & Topics:**

- [Expressions](/docs/templates/expressions/)
- [Expressions – Attribute Expressions](/docs/templates/expressions/#attribute-expressions)
- [Expressions – Property Expressions](/docs/templates/expressions/#property-expressions)
- [Event communication between web components](https://www.youtube.com/watch?v=T9mxtnoy9Qw&themeRefresh=1) (video)

### Dispatch Events Up

To send data up the tree to ancestors, you can dispatch custom events. Yo emit an event, use `Element.dispatchEvent()`.

`dispatchEvent()` takes an event object as the first argument. Construct a custom event object like this:

`new CustomEvent('event-name', {detail: data, bubbles: true, composed: true})`

Provide data you wat to pass to ancestors in the `detail` property of the event, and ancestors can react to the event by adding an event listener to the component like this:

`@event-name=${this.eventHandler}`

If you want an event to bubble through shadow Roots, set `composed: true`.

{% playground-ide "articles/lit-cheat-sheet/data-up", true %}

**Related Documentation & Topics:**

- [Event communication between web components](https://www.youtube.com/watch?v=T9mxtnoy9Qw&themeRefresh=1) (video)
- [A complete guide on shadow DOM and event propagation](https://pm.dartus.fr/posts/2021/shadow-dom-and-event-propagation/) (external)
- [Expressions](/docs/templates/expressions/)
- [Expressions – Event listener expressions](/docs/templates/expressions/#event-listener-expressions)
- [Events](/docs/components/events/)
- [Customizing event listener options](/docs/components/events/#event-options-decorator)

