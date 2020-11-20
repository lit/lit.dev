---
title: Template basics
eleventyNavigation:
  key: Template basics
  parent: Templates
  order: 1
---

Lit uses the lit-html templating library, which lets you express web UI as a function of data. 

Lit templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative, HTML:

```js
html`<h1>Hello World</h1>`
```

You can add dynamic content to your templates with **binding expressions**. Binding expressions are denoted with the standard JavaScript syntax for template literals:

```js
html`<h1>Hello ${name}</h1>`
```

The `html` tag function returns a `TemplateResult` object—a lightweight object that represents a template that Lit can render. 

You can define a Lit component's template inside its `render` function:

```js
import {LitElement, html} from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  name = 'World;

  render() {
    return html`<div>Hello, ${this.name}</div>`;
  }
}
```

As shown in the example, you can use `this` inside a binding expression to access instance properties and methods on your component.

<div class="alert alert-info">

**Efficient updates.** The template syntax might look like you're just doing string interpolation. But with tagged template literals, the browser passes the tag function an array of strings (the static portions of the template) and an array of expressions (the dynamic portions). Lit uses this to build an efficient representation of your template, so it can re-render only the parts of template that have changed.

</div>

You can also use lit-html for standalone templating, outside of a Lit component. For details, see [Standalone lit-html templates](/guides/libraries/standalone-templates).


## Binding expressions

A binding is a placeholder for dynamic content in the template. The binding can contain any JavaScript expression, which is evaluated whenever the template renders. In a Lit component, this means whenever the `render` method gets called.

There are several types of bindings:

  * Text:

    ```js
    html`<h1>Hello ${name}</h1>`
    ```

  * Attribute:

    ```js
    html`<div id=${id}></div>`
    ```

  * Boolean Attribute:

    ```js
    html`<input type="checkbox" ?checked=${checked}>`
    ```

  * Property:

    ```js
    html`<input .value=${value}>`
    ```

  * Event Listener:

    ```js
    html`<button @click=${(e) => console.log('clicked')}>Click Me</button>`
    ```

  * Element binding:
    ```js
    html`<input ${ref(buttonRef)}`>
    ```

## Bind to text content

A text binding can replace part of all of the content of a tag. For example:

```js
html`<p>Hello, ${name}</p>`
```

Or:

```js
html`<main>${bodyText}</main>`
```

Text bindings can take many kinds of values: 

* Primitive values
* `TemplateResult` objects
* DOM nodes
* Arrays or iterables of any of the supported types


## Templates are expressions

A Lit template is itself a JavaScript expression, so you can nest templates: 

```js
const nav = html`<nav>...</nav>`;
const page = html`
  ${nav}
  <main>...</main>
`;
```

This means you can use plain JavaScript to create conditional templates, repeating templates, and more.

```js
html`
  ${this.user.isloggedIn
      ? html`Welcome ${this.user.name}`
      : html`Please log in`
  }
`;
```

For more on conditionals, see [Conditional templates](conditionals). For more on using JavaScript to create repeating templates, see [Lists & repeating templates](lists).

## Bind to attributes 

In addition to using bindings in the text content of a node, you can bind them to a node's attribute and property values, too.

By default, an expression in the value of an attribute creates an attribute binding:

```js
// set the class attribute
html`<div class=${this.textClass}>Stylish text.</div>`;
```

Since attribute values are always strings, the expression should return a value that can be converted into a string.

If the binding makes up the entire attribute value, you can leave off the quotes. If the binding makes up only part of the attribute value, you need to quote the entire value:

```js
//
html`<img src="/images/${this.image}">`;
```

Use the `?` prefix for a boolean attribute binding. The attribute is added if the expression evaluates to a truthy value, removed if it evaluates to a falsy value:

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

## Bind to properties

You can also bind to a JavaScript property of an element using the `.` prefix and the property name:

```js
html`<input .value=${this.itemCount}></input>`;
```

You can use property bindings to pass complex data down the tree to subcomponents. For example, if you have a `my-list` component with a `listItems` property, you could pass it an array of objects:

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

Note that the property name in this example—`listItems`—is mixed case. Although HTML attributes are case-insensitive, Lit preserves the case for property bindings when it processes the template.

## Add event listeners

Templates can also include declarative event listeners. An event listener looks like an attribute binding, but with the prefix `@` followed by an event name:

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

This is similar to calling `addEventListener('click', this.clickHandler)` on the button element. The event handler is automatically bound to the element, so you can use the `this` value inside the handler to refer to the component instance.

```js
clickHandler() {
  this.clickCount++;
}
```

The event listener can be either a plain function, or an object with a `handleEvent` method:

```js
const clickHandler = {
  // handleEvent method is required.
  handleEvent(e) { 
    console.log('clicked!');
  },
  // event listener objects can also define zero or more of the event 
  // listener options: capture, passive, and once.
  capture: true,
};
```

## Directives

Lit allows special functions, called _directives_, to customize the way a binding expression is processed and rendered. Lit provides some built-in directives, or you can write your own.

For example, you can use the `until` directive to render placeholder content while you load data asynchronously. 

```js
import {html} from 'lit-element';
import {until} from 'lit-html/directives/until.js';

const content = fetch('./content.txt').then(r => r.text());

html`${until(content, html`<span>Loading...</span>`)}`
```

For a list of directives provided with Lit, see [Built-in directives](directives). 
