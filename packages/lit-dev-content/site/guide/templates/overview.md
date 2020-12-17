---
title: Overview
eleventyNavigation:
  key: Overview
  parent: Templates
  order: 1
---

Lit templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative, HTML:

```js
html`<h1>Hello World</h1>`
```

You can add dynamic content to your templates with **expressions**. Expressions are denoted with the standard JavaScript syntax for expressions in template literals:

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

As shown in the example, you can use `this` inside an expression to access instance properties and methods on your component.

<div class="alert alert-info">

**Efficient updates.** The template syntax might look like you're just doing string interpolation. But with tagged template literals, the browser passes the tag function an array of strings (the static portions of the template) and an array of expressions (the dynamic portions). Lit uses this to build an efficient representation of your template, so it can re-render only the parts of template that have changed.

</div>

You can also use Lit's templating library for standalone templating, outside of a Lit component. For details, see [Standalone lit-html templates](/guides/libraries/standalone-templates).


## Expressions

An expression is a placeholder for dynamic content in the template. The expression can be any JavaScript expression, and it's evaluated whenever the template renders. In a Lit component, this means whenever the `render` method gets called.

How an expression is interpreted depends on where it appears in the template.

**Child nodes**

Expressions can specify child nodes, including text.

```js
html`
<h1>Hello ${name}</h1>
<ul>
  ${listItems}
</ul>
```

**Attribute values**

Expressions can set attribute values.

```js
<div class=${highlightClass}></div>
```

Expressions can also set boolean attributes.

```js
<div ?hidden=${!show}></div>
```

**Properties**

Expressions can also properties.

```js
<input .value=${value}>
```

**Event listeners**

Expressions can specify event listeners.

```js
<button @click=${(e) => console.log('clicked')}>Click Me</button>
```

**Element references**

A special type of expression can be used to access the element itself.

```js<input ${ref(inputRef)}>
```


## Add child nodes

An expression that occurs between the start and end tags of an element can add child nodes to the element. For example:

```js
html`<p>Hello, ${name}</p>`
```

Or:

```js
html`<main>${bodyText}</main>`
```

Expressions in the child position can take many kinds of values:

* Primitive values
* `TemplateResult` objects
* DOM nodes
* Arrays or iterables of any of the supported types

### Expressions can return templates

Since an expression in the child position can return a `TemplateResult` you can nest and compose templates:

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

## Set attributes

In addition to using expressions to add child nodes, you can use them to set an elements's attribute and property values, too.

By default, an expression in the value of an attribute sets the attribute:

```js
// set the class attribute
html`<div class=${this.textClass}>Stylish text.</div>`;
```

Since attribute values are always strings, the expression should return a value that can be converted into a string.

If the expression makes up the entire attribute value, you can leave off the quotes. If the expression makes up only part of the attribute value, you need to quote the entire value:

```js
//
html`<img src="/images/${this.image}">`;
```

To set a boolean attribute, use the `?` prefix with the attribute name. The attribute is added if the expression evaluates to a truthy value, removed if it evaluates to a falsy value:

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

## Set properties

You can set a JavaScript property on an element using the `.` prefix and the property name:

```js
html`<input .value=${this.itemCount}></input>`;
```

You can use this syntax to pass complex data down the tree to subcomponents. For example, if you have a `my-list` component with a `listItems` property, you could pass it an array of objects:

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

Note that the property name in this example—`listItems`—is mixed case. Although HTML *attributes* are case-insensitive, Lit preserves the case for property names when it processes the template.

## Add event listeners

Templates can also include declarative event listeners. Adding event listeners is like setting an attribute or property:

*   Use the prefix `@` followed by the event name in place of an attribute name.
*   The expression should evaluate to an event listener.

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

This is similar to calling `addEventListener('click', this.clickHandler)` on the button element.
The event listener can be either a plain function, or an object with a `handleEvent` method——the same as the `listener` argument to the standard [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method.

In a Lit component, the event listener is automatically bound to the component, so you can use the `this` value inside the handler to refer to the component instance.

```js
clickHandler() {
  this.clickCount++;
}
```

## Directives

Lit allows special functions, called _directives_, to customize the way an expression is processed and rendered. Lit provides some built-in directives, or you can write your own.

For example, the `classMap` directive lets you specify a set of CSS classes in a single expression:

<!-- TODO correct directive import path -->
```js
import {html} from 'lit-element';
import {classMap} from 'lit-element/directives/classMap.js';
...
render() {
  const classes = {
    active: true,
    highlighted: true,
    error: false
  };

  return html`<div class=${classMap(classes)}>...</div>`;
}
```

The `classMap` directive takes an object as input and sets a class for each property with a truthy value. For example, the above example would render:

```html
<div class="active highlighted">...</div>
```

For a list of directives provided with Lit, see [Built-in directives](directives).

