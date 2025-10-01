---
title: The Lit Cheat Sheet
publishDate: 2025-02-03
lastUpdated: 2025-02-03
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

To use a component, import the file with its definition.

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

Lit-html has a built-in event listener expression to add event listeners to
elements. You can also use event listeners to mimic two-way databinding with
input elements.

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

### Render String to HTML

To render a string of HTML as HTML in Lit, use the `unsafeHTML` directive.

{% playground-ide "articles/lit-cheat-sheet/unsafe-html", true %}

{% aside "negative" %}

Be careful when using `unsafeHTML` as it can open your application up to
cross-site scripting (XSS) and other attacks.

Only use `unsafeHTML` with trusted sources and strings as you would use
`Element.prototype.innerHTML`.

{% endaside %}

**Related Documentation & Topics:**

- [Built-in directives – `unsafeHTML`](/docs/templates/directives/#unsafehtml)
- [innerHTML Security considerations](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#security_considerations) (external)

### Bind to HTML Tag Name

In rare cases, you need to bind to an HTML tag name to change the rendered
element. You can do this safely with the `static-html` module and the `literal`
template tag.

{% playground-ide "articles/lit-cheat-sheet/bind-tag-name", true %}


{% aside "warn" %}

Be careful when using static HTML templates for switching tag names as it
requires reapplying all bindings in the template every time the tag name
changes.

This can be costly, and in most cases it is recommended to use conditional
template rendering instead of switching tag names with static HTML templates.

{% endaside %}

**Related Documentation & Topics:**

- [Static Expressions](/docs/templates/expressions/#static-expressions)

### Bind Any Value to HTML Tag Name or Attribute Name

In even rarer cases, you need to bind any arbitrary string value to an HTML tag
name to change the rendered element. You can do this with the `unsafeStatic()`
directive. This may be helpful if you are implementing an SSR framework that
uses lit-html for rendering.

{% playground-ide "articles/lit-cheat-sheet/unsafe-static", true %}

{% aside "negative" %}

Be careful when using `unsafeStatic` as it can open your application up to
cross-site scripting (XSS) and other attacks.

Only use `unsafeStatic` with trusted sources and strings as you would use
`Element.prototype.innerHTML`. Additionally, `unsafeStatic` is not cached and
will re-render the entire template every time the value changes which may
negatively affect performance.

{% endaside %}

- [Non-literal Statics](/docs/templates/expressions/#non-literal-statics)
- [Static Expressions](/docs/templates/expressions/#static-expressions)

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

### Importing Styles as a String

In some rare cases, you may receive trusted styles as a string and may need to
apply them to a component. You can do this with native, constructable
stylesheets.

{% playground-ide "articles/lit-cheat-sheet/constructable-stylesheets", true %}

{% aside "negative" %}

Be careful when using constructable stylesheets as it can open your application
to privacy and security vulnerabilities.

Only use constructable stylesheets with trusted sources and strings.

{% endaside %}

**Related Documentation & Topics:**

- [Constructable Stylesheets](https://web.dev/articles/constructable-stylesheets) (external)
- [`CSSResultOrNative`](/docs/api/styles/#CSSResultOrNative)

### Importing CSS Files into Components

In some cases, you may want to import styles in the form of a CSS files rather
than a Lit CSSResult or a string. Currently there

{% aside "warn" %}

This is a new feature recently added to some browsers.

Please check [browser compatibility on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with#browser_compatibility).

Due to the newness of this feature, the following example uses JavaScript and
may not work in all in certain browsers.

{% endaside %}

{% playground-ide "articles/lit-cheat-sheet/import-attributes", true %}

{% aside "positive" %}

Some better-supported alternatives to this approach may include:

- A build tool plugin that transforms your CSS imports into Lit `CSSResult`
  similar to
  [`rollup-plugin-lit-css`](https://www.npmjs.com/package/rollup-plugin-lit-css)
- Using a bundler tool to transform your CSS imports into strings and then using
  Constructable Stylesheets
- Using a `<link rel="stylesheet" href="...">` in your template, but this will
  cause FOUC.

{% endaside %}

**Related Documentation & Topics:**

- [Import Attributes](https://v8.dev/features/import-attributes) (external)
- [Import Attributes Browser Compatiblity Table](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with#browser_compatibility) (external)
- [Proposal Import Attributes](https://github.com/tc39/proposal-import-attributes) (external)
- [Import JSON, CSS and more with import attributes](https://olliewilliams.xyz/blog/import-attributes/) (external)
- [Using CSS Module Scripts to import stylesheets](https://web.dev/articles/constructable-stylesheets) (external)
  - **NOTE:** The syntax of the import assertions proposal in this article was
    deprecated in favor of import attribtues which uses `with` rather than
    `assert`.
- Build Tools
  - [`rollup-plugin-lit-css`](https://www.npmjs.com/package/rollup-plugin-lit-css)
  - [`esbuild-plugin-lit-css`](https://www.npmjs.com/package/esbuild-plugin-lit-css)
  - [`lit-css-loader`](https://www.npmjs.com/package/lit-css-loader)
  - [`vite-plugin-lit-css`](https://www.npmjs.com/package/vite-plugin-lit-css)

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

This is generally not recommended, but it may sometimes be worthwhile for integration with older systems or libraries that may not be updated to work with Shadow DOM.

Since the Shadow root no longer exists, `<slot>` does not work and Lit will no longer handle the `static styles` property for you. You must decide how to handle your styles.

{% endaside %}

**Related Documentation & Topics:**

- [Implementing `createRenderRoot()`](/docs/components/shadow-dom/#implementing-createrenderroot)

### Slotting Components Into Another Component's Shadow DOM

You can slot a component into another component's shadow DOM by using the
`<slot>` element. If you're familiar with React, this is similar to
`props.children`.

{% playground-ide "articles/lit-cheat-sheet/shadow-slotting", true %}

**Related Documentation & Topics:**

- [Slots](/docs/components/shadow-dom/#slots)
- [Working With Shadow DOM](/docs/components/shadow-dom/)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (video)
- [How to Build a Carousel in Lit](https://www.youtube.com/watch?v=2RftvylEtrE) (video)
- [Build an Animated Carousel Tutorial](/tutorials/carousel)

### Styling a Slotted Component

Slotted components use the browser's native Shadow DOM projection features. In
order to keep strong, performant, and encapsulated styles, the browser vendors
have placed restrictions on styling slotted content.

You can style directly-slotted elements with the `::slotted()` pseudo-selector.
If you would like to style children of slotted content, you should use CSS
Custom Properties.

{% playground-ide "articles/lit-cheat-sheet/styling-slotted", true %}

**Related Documentation & Topics:**

- [Styling the Component's Children](/docs/components/styles/#slotted)
- [Build an animated carousel element tutorial](/tutorials/carousel)
- [How to style your Lit elements](https://www.youtube.com/watch?v=Xt7blcyuw5s) (video)
- [How to build a Carousel in Lit](https://www.youtube.com/watch?v=2RftvylEtrE&t) (video)

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

If this is your use case, you might generally be better off using a
[`repeat()` directive](#re-rendering-lists-efficiently).

{% endaside %}

**Related Documentation & Topics:**

- [Lifecycle - Triggering an update](/docs/components/lifecycle/#reactive-update-cycle-triggering)
- [Rendering Arrays](/docs/templates/lists/#rendering-arrays)
- [Reactivity Tutorial - Triggering an update](/tutorials/reactivity/#3)
- [Working With Lists Tutorial](/tutorials/working-with-lists/)

### Custom Attribute Converters

In advanced cases, you may need to convert an attribute value to a property in
a special way and vice versa. You can do this with a custom attribute converter.

{% playground-ide "articles/lit-cheat-sheet/custom-attribute-converter", true %}

{% aside "info" "no-header" %}

Attribute converters run only when an attribute is set on the element or when
a Reactive Property is set with the `reflect: true` option turned on.

{% endaside %}

**Related Documentation & Topics:**

- [Reactive properties - Providing a custom converter](/docs/components/properties/#conversion-converter)
- [Reactive properties - Using the default converter](/docs/components/properties/#conversion-type)
- [Attributes](/docs/components/properties/#attributes)
- [Custom Attribute Converters Tutorial](/tutorials/custom-attribute-converter/)
- [Reactive Properties](/docs/components/properties/)
- [Public reactive properties](/docs/components/properties/#declare)
- [Custom attribute converter snippet](/playground/#sample=examples/properties-custom-converter)

### Derived Read-Only State

Sometimes it is helpful to make a property that is derived from other properties
or state. The simplest way you can do is is with a native getter.

{% playground-ide "articles/lit-cheat-sheet/derived-state", true %}

**Related Documentation & Topics:**

- [Reactive Properties](/docs/components/properties/)
- [Custom Property Accessors](/docs/components/properties/#accessors)
- [get - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) (external)
- [set - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) (external)

### Reconcile Values Between Reactive Properties

If you have multiple reactive properties that depend on each other, you can
reconcile their values in the Lit's `willUpdate()` lifecycle method.

`willUpdate()` is a good place to reconcile values between properties that can
also run on the server since `willUpdate()` is called during Lit SSR's
server-side rendering.

{% playground-ide "articles/lit-cheat-sheet/reconcile-willupdate", true %}

- [Lifecycle - `willUpdate()`](/docs/components/lifecycle/#willupdate)
- [What happens when properties change](/docs/components/properties/#when-properties-change)
- [Reactive Properties](#reactive-properties)
- [Authoring components for Lit SSR](/docs/ssr/authoring/)

### Sync Reactive Property with Browser Features

If you have reactive properties that depend on a browser API (like localStorage
for example), you can reconcile their values in the Lit's `update()` lifecycle
method.

`update()` is a good place to reconcile values between properties that
need to access Browser APIs or the DOM. `update()` happens before render.

{% playground-ide "articles/lit-cheat-sheet/reconcile-update", true %}

**Related Documentation & Topics:**

- [Lifecycle - `update()`](/docs/components/lifecycle/#update)
- [What happens when properties change](/docs/components/properties/#when-properties-change)
- [Reactive Properties](#reactive-properties)
- [Authoring components for Lit SSR](/docs/ssr/authoring/)

### Reconcile Values Between Reactive Properties and DOM

If you have multiple reactive properties that depend on calculations from the
component's rendered DOM, you can reconcile their values in the Lit's
`updated()` lifecycle method.

`updated()` is a good place to reconcile values between properties that need to
since `updated()` is called after the component has rendered its template.
Though it is highly recommended to not update Reactive Properties in `updated()`
unless necessary as it may trigger re-renders after a render has just completed.
Lit is fast, but this could still be unnecessary work.

{% playground-ide "articles/lit-cheat-sheet/reconcile-updated", true %}

**Related Documentation & Topics:**

- [Lifecycle - `updated()`](/docs/components/lifecycle/#updated)
- [Getting An Element Reference](#getting-an-element-reference)
- [What happens when properties change](/docs/components/properties/#when-properties-change)
- [Reactive Properties](#reactive-properties)
- [Authoring components for Lit SSR](/docs/ssr/authoring/)

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

This means that while they generally follow a specific order, they may intermix
because the browser controls the native lifecycle, while Lit and JavaScript
manage the Lit lifecycle.

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
- Is native browser callback
- Requires call to `super()`
- A good place to set initial properties
- Do **NOT** require parameters in the constructor or modify DOM

#### `connectedCallback`

- *May* run on the server. (This has not been finalized.)
- Runs when the element is added to the DOM via:
  - `element.appendChild(element)`
  - `element.innerHTML = '<my-element></my-element>'`
  - etc.
- Is native browser callback
- Requires call to `super.connectedCallback()`
- Can run multiple times, but a good place to set up event listeners to external elements like `document`.

#### `willUpdate`

- Runs on the server – do **NOT** access the DOM or browser APIs
- Is **NOT** a native browser callback (a Lit-specific method)
- Does **NOT** require call to `super.willUpdate()`
- A good place to set up properties that depend on other properties

#### `update`

- Runs after `willUpdate`
- Is **NOT** native browser callback (a Lit-specific method)
- Typically requires call to `super.update()` **AFTER** custom logic
- A good place to update properties that depend on other properties that depend on DOM

#### `render`

- Is **NOT** a native browser callback (a Lit-specific method)
- Does **NOT** require call to `super.render()`
- Runs on the server - do NOT access the DOM or browser APIs

#### `firstUpdated`

- Runs after the first render
- Is **NOT** a native browser callback (a Lit-specific method)
- Does **NOT** require call to `super.firstUpdated()`
- A good place to perform initializations that require access to the component's
  rendered DOM

#### `updated`

- Runs after `render` and `firstUpdated`
- Is **NOT** a native browser callback (a Lit-specific method)
- Does **NOT** require a call to `super.updated()`
- A good place to do some updates that require the component's rendered DOM or
  to update properties that depend on the rendered DOM
- Avoid setting reactive properties in this lifecycle as doing so may trigger
  unnecessary re-renders. Try to do them in `willUpdate` or `update` if
  possible.

#### `disconnectedCallback`

- Is called **AFTER** the element is removed from the DOM
- Is native browser callback
- Requires call to `super.connectedCallback()`
- A good place to clean up event listeners

### Waiting for an update

All Lit elements have asynchronous lifecycles. The reason for this is so that property changes (e.g. el.foo = 1; el.bar = 2;) are batched for efficiency and correctness.

You need to wait for the `updateComplete` promise to resolve before you can be sure that the element has finished updating its DOM.

{% playground-ide "articles/lit-cheat-sheet/update-complete", true %}

**Related Documentation & Topics:**

- [Lifecycle](/docs/components/lifecycle/)
- [updateComplete()](/docs/components/lifecycle/#updatecomplete)
- [requestUpdate()](/docs/components/lifecycle/#requestUpdate)
- [Getting an Element Reference](#getting-an-element-reference)
- [Getting an Element Reference After Update](#getting-an-element-reference-after-update)

### Asynchronous Tasks

If you need to perform an asynchronous task in a Lit Element. You may want to
use the `@lit/task` package. It handles marrying basics of managing asynchronous
and the Lit lifecycle.

The following example fetches a Pokemon by ID from the
[PokeAPI](https://pokeapi.co/) based on pokemon name. To do so you:

1. Initialize the task with `new Task(...)`
2. Task is a Reactive Controller, so you pass it a reference to the Reactive
   Element (`this`)
3. Write an async function that fetches and returns the data
4. Give Task a function that will return the reactive properties that Task
   relies on
5. Render all the states of the Task in the `render()` method with
   `Task.prototype.render()`

{% playground-ide "articles/lit-cheat-sheet/task", true %}

**Related Documentation & Topics:**

- [Asynchronous Tasks](/docs/data/task/)
- [Lit Labs – Task](https://www.youtube.com/watch?v=niWKuGhyE0M) (video)
  - NOTE: This video was published before Task had graduated from Labs.
- [Reactive Controllers – Asynchronous Tasks](/docs/composition/controllers/#asynchronous-tasks)

## Events

### Adding listeners to the host element

A common pattern is to add event listeners to the host element in the `constructor()`. There is no need to remove these listeners as they are automatically cleaned up by the browser's garbage collector when the element is no longer referenced.

{% playground-ide "articles/lit-cheat-sheet/host-listeners", true %}

**Related Documentation & Topics:**

- [Lifecycle](/docs/components/lifecycle/)
- [Events](/docs/components/events/)
- [Authoring components for Lit SSR](/docs/ssr/authoring/)
- [A complete guide on shadow DOM and event propagation](https://pm.dartus.fr/posts/2021/shadow-dom-and-event-propagation/) (external)

### Adding listeners to global nodes

A common pattern is to add event listeners to the to global nodes, like `document` or `window`, in the `connectedCallback` and remove them in the `disconnectedCallback`.

{% playground-ide "articles/lit-cheat-sheet/global-listeners", true %}

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

For boolean attributes, use a question mark instead of a period, like this:

`?programmer=${true}`.

You generally want to expose your component's external attribute and property
API with <ts-js><span slot="ts"><code>@property()</code> instead of
<code>@state()</code></span><span slot="js"><code>static properties = {propName: {state: false}}</code></span></ts-js>.

{% playground-ide "articles/lit-cheat-sheet/pass-data-down", true %}

**Related Documentation & Topics:**

- [Expressions](/docs/templates/expressions/)
- [Expressions – Attribute Expressions](/docs/templates/expressions/#attribute-expressions)
- [Expressions – Property Expressions](/docs/templates/expressions/#property-expressions)
- [Event communication between web components](https://www.youtube.com/watch?v=T9mxtnoy9Qw&themeRefresh=1) (video)

### Dispatch Events Up

To send data up the tree to ancestors, you can dispatch custom events. To emit
an event, use `Element.dispatchEvent()`.

`dispatchEvent()` takes an event object as the first argument. Construct a
custom event object like this:

`new CustomEvent('event-name', {detail: data, bubbles: true, composed: true})`

Provide data you want to pass to ancestors in the `detail` property of the
event, and ancestors can react to the event by adding an event listener to the
component like this:

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

### Context

If you need to pass data down to a subtree without using properties or "prop
drilling", you might want to use
[`@lit/context`](https://www.npmjs.com/package/@lit/context).

{% playground-ide "examples/context-consume-provide", true %}

**Related Documentation & Topics:**

- [Context](/docs/data/context/)
- [WCCG Context Community Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) (external)

## Accessing DOM

### Getting An Element Reference

The `@query` decorator allows you to access a reference to a single element in
the component's shadow DOM using the syntax of
`ShadowRoot.prototype.querySelector()`.

In JavaScript, you can access the element using
`this.shadowRoot.querySelector()`.

{% playground-ide "articles/lit-cheat-sheet/dom-query", true %}

{% aside "warn" %}

NOTE: DOM is typically not ready until `firstUpdated` is called.

This means that DOM is accessible by `updated()` on first render as well, but
not in `constructor()`, `connectedCallback()`, or `willUpdate()` until
subsequent renders.

{% endaside %}

- [@query](/docs/components/shadow-dom/#query)
- [@queryAll](/docs/components/shadow-dom/#query-all)
- [@queryAsync](/docs/components/shadow-dom/#query-async)
- [Lit lifecycle](/docs/components/lifecycle/)

### Other Methods to Get An Element Reference

The `ref()` directive is a lit-html-specific method to acquire an element
reference. The `ref()` directive is a good alternative when:

- You can't use the `@query` decorator (or its JS equivalent)
- You cannot determine when an element will be rendered
- You need to pass element references from a child to a parent component (not common)
- You're migrating from another framework like React
- You need to run a function when the referenced element changes

{% playground-ide "articles/lit-cheat-sheet/dom-ref", true %}

{% aside "positive" %}

The `ref()` directive also accepts a callback function that will be called with
the element reference as an argument when the target element is connected to the
DOM.

Though, it is generally recommended to use the `@query` or the
`@queryAsync` decorators when possible as they are generally more performant and
less-reliant on Lit.

{% endaside %}

**Related Documentation & Topics:**

- [Built-in Directives – ref](/docs/templates/directives/#referencing-rendered-dom)
- [Templates – Element Expressions](/docs/templates/expressions/#element-expressions)

### Getting An Element Reference After Update

The `@queryAsync` decorator is just like the `@query` decorator, but it waits
for the current host element to finish its update before resolving. This is
useful when you need to access an element that is rendered asynchronously by a
change in the component's state.

The JavaScript equivalent awaits the `this.updateComplete` promise before
calling `this.shadowRoot.querySelector()`.

{% playground-ide "articles/lit-cheat-sheet/dom-query-async", true %}

**Related Documentation & Topics:**

- [@queryAsync](/docs/components/shadow-dom/#query-async)
- [`updateComplete`](/docs/components/lifecycle/#updatecomplete)
- [`getUpdateComplete()`](/docs/components/lifecycle/#getUpdateComplete)
- [Lit lifecycle](/docs/components/lifecycle/)
- [@query](/docs/components/shadow-dom/#query)
- [@queryAll](/docs/components/shadow-dom/#query-all)
- [Waiting for an update](#waiting-for-an-update)

### Accessing Slotted Content

Shadow DOM uses the `<slot>` element which allows you to project content from
outside the shadow root into the shadow root. You can access slotted content
using the <ts-js><span slot="ts"><code>@queryAssignedElements</code> decorator</span><span slot="js"><code>HTMLSlotElement.assignedElements()</code> method</span></ts-js>.

You give it a slot name to access, and the element selector to filter for.

{% playground-ide "articles/lit-cheat-sheet/dom-qae", true %}

**Related Documentation & Topics:**

- [Accessing Slotted Children](/docs/components/shadow-dom/#accessing-slotted-children)
- [Slots](/docs/components/shadow-dom/#slots)
- [`assignedElements` - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements) (external)
- [`HTMLSlotElement` - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement) (external)
- [`<slot>` - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) (external)

## Signals

Signals are data structures for managing observable state. They either store a
value or compute a value based on other signals. The Lit project tries to
conform to the
[Signals standard proposal](https://github.com/tc39/proposal-signals) via the
[`@lit-labs/signals` package](https://www.npmjs.com/package/@lit-labs/signals)
in order to provide a cross-framework standard for reactive state management
solution.

### Common Signal Setup (SignalWatcher)

The most common way to use signals in Lit is to use the `SignalWatcher` mixin.
When an accessed signal value changes, `SignalWatcher` will trigger the Lit
element update lifecycle. This includes signals read in `shouldUpdate()`,
`willUpdate()`, `update()`, `render()`, `updated()`, `firstUpdated()`, and
reactive controller's `hostUpdate()` and `hostUpdated()`.

{% playground-ide "articles/lit-cheat-sheet/signal-watcher", true %}

**Related Documentation & Topics:**

- [Signals docs](/docs/data/signals/)
- [Lit lifecycle](/docs/components/lifecycle/)
- [`@lit-labs/signals` npm package](https://www.npmjs.com/package/@lit-labs/signals) (external)
- [Signals standards proposal](https://github.com/tc39/proposal-signals) (external)

### Pinpoint Signal Updates (watch directive)

The `watch()` directive allows you to pinpoint exactly where a signal should
update the DOM without re-triggering the lit-html re-render. What this means is
that using the `watch()` directive will not trigger the `render()` unless it
triggers the change of a traditional Lit Reactive Property.

{% playground-ide "articles/lit-cheat-sheet/signals-watch-directive", true %}

{% aside "warn" "no-header" %}

This may be a helpful way to optimize performance in your Lit components, but
*always measure for your use case*.

{% endaside %}

**Related Documentation & Topics:**

- [The `watch()` directive](https://www.npmjs.com/package/@lit-labs/signals#watch-directive) (external)
- [Reactive Properties](#reactive-properties)
- [Signals docs](/docs/data/signals/)
- [Lit lifecycle](/docs/components/lifecycle/)
- [`@lit-labs/signals` npm package](https://www.npmjs.com/package/@lit-labs/signals) (external)
- [Signals standards proposal](https://github.com/tc39/proposal-signals) (external)

### Signals HTML Template Tag

The `@lit-labs/signals` package also provides an `html` template tag that can
be used in place of Lit's default `html` tag and automatically wraps any signals
in the template with a `watch()` directive.

{% playground-ide "articles/lit-cheat-sheet/signals-html-tag", true %}

**Related Documentation & Topics:**

- [The `html` tag and `withWatch()`](https://www.npmjs.com/package/@lit-labs/signals#html-tag-and-withwatch) (external)
- [the `SignalWatcher()` mixin](#common-signal-setup-(signalwatcher))
- [The `watch()` directive](#pinpoint-signal-updates-(watch-directive))

### Make Signal Values from Other Signals (computed)

Sometimes you need to derive a value from other signals. You can do this with
a `computed()` signal.

{% playground-ide "articles/lit-cheat-sheet/signals-computed", true %}

**Related Documentation & Topics:**

- [Signals docs](/docs/data/signals/)
- [`@lit-labs/signals` npm package](https://www.npmjs.com/package/@lit-labs/signals) (external)

### Reacting to Signal Changes (effects)

The official `signal-utils` package currently provides an experimental
`effect()` function that allows you to react to signal changes and run side
effects.

{% playground-ide "articles/lit-cheat-sheet/signals-effect", true %}

{% aside "warn" %}

The `effect()` function from the `signal-utils` package is experimental.

Follow the
[`signal-utils` package](https://www.npmjs.com/package/signal-utils#leaky-effect-via-queuemicrotask)
for updates on this project.

{% endaside %}

**Related Documentation & Topics:**

- [Signals docs](/docs/data/signals/)
- [`@lit-labs/signals` npm package](https://www.npmjs.com/package/@lit-labs/signals) (external)
- [The `changedProperties` map](/docs/components/lifecycle/#changed-properties)
- [signal-polyfill – Creating a simple effect](https://github.com/proposal-signals/signal-polyfill?tab=readme-ov-file#creating-a-simple-effect) (external)

### Sharing Global, Reactive Data Across Components

If your component needs to share a global state with another component and you
do not need your component to be compatible with Lit's declarative event
listener syntax, you can use a shared signal to share state across components.

Here is the scoreboard example from the
[Dispatch Events Up](#dispatch-events-up) section, but using shared signals.

{% playground-ide "articles/lit-cheat-sheet/signals-share", true %}

**Related Documentation & Topics:**

- [Signals docs](/docs/data/signals/)
- [`@lit-labs/signals` npm package](https://www.npmjs.com/package/@lit-labs/signals) (external)
- [Data Flow and State Management](#data-flow-and-state-management)
