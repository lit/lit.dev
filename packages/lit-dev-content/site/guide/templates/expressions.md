---
title: Expressions
eleventyNavigation:
  key: Expressions
  parent: Templates
  order: 2
---

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

```js
<input ${ref(inputRef)}>
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

The following sections describe how these values are handled.

### Primitive values: String, Number, Boolean, null, undefined

Primitives values are converted to strings when interpolated into text content or attribute values. They are checked for equality to the previous value so that the DOM is not updated if the value hasn't changed.

### Templates

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

### DOM nodes

Any DOM Node can be passed to a child position expression. The node is attached to the DOM tree at that point, and so removed from any current parent:

```js
const div = document.createElement('div');
const page = html`
  ${div}
  <p>This is some text</p>
`;
```

### Arrays and iterables

An expression can also return an array or iterable of any of the supported types, in any combination.

You can use this feature along with standard JavaScript like the Array `map` method to create repeating templates and lists. For examples, see see [Lists & repeating templates](lists).

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

## Element-level expressions

You can also add an expression that accesses an element instance, instead of a single property or attribute on an element:

```js
html`<div ${myDirective}></div>`
```

Element-level expressions currently only work with directives. You can't use any other kind of value with an element expression. You can think of these expressions as a low-level mechanism you can use to build other expression types that aren't yet supported by Lit.

There are a few built-in directives that can be used in element expressions. One example is the `ref` directive, which provides a reference to the rendered element.

```js
import {LitElement, html} from 'lit-element';
import {ref, Ref} from 'lit-html/directives/ref.js';

class InputElement extends LitElement {
  constructor() {
    super();
    // Ref is a container for the element reference
    this.inputRef = new Ref();
  }

  render() {
    return html`
      <input ${ref(inputRef)}>
      <button @click=${this.focusInput}>Focus</button>
      `;
  }

  focusInput() {
    this.inputRef.value.focus();
  }
}
```

## Well-formed templates

Lit templates must be well-formed HTML, and expressions can only occur in certain places. The templates are parsed by the browser's built-in HTML parser before any values are interpolated.

<div class="alert alert-info">

**Finding malformed templates.** Most cases of malformed templates are not detectable at runtime, so you won't see  warnings—just templates that don't behave as you expect. Fortunately, there are <a href="TODO LINK">linting tools</a> and <a href="TODO LINK">IDE plugins</a> that you can use to find issues in your templates during development.

</div>

Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Standard expressions **_can only occur_** in attribute-value and child content positions.

    ```html
    <!-- attribute-value position -->
    <div label=${label}></div>
    <button ?disabled=${isDisabled}>Click me!</button>
    <input .value=${currentValue}>
    <button @click=${this.handleClick()}>

    <!-- child content position -->
    <div>${textContent}</div>
    ```

  * The special element-level expression occurs inside the opening tag after the tag name:

    ```html
    <div ${ref(elementReference)}></div>
    ```

 *  Expressions **_cannot_** appear where tag or attribute names would appear.

    ```html
    <!-- ERROR -->
    <${tagName}></${tagName}>

    <!-- ERROR -->
    <div ${attrName}=true></div>
    ```


 *  Templates can have multiple top-level elements and text.

 *  Templates **_should not contain_** unclosed elements—they will be closed by the HTML parser.

    ```js
    // HTML parser closes this div after "Some text"
    const template1 = html`<div class="broken-div">Some text`;
    // When joined, "more text" does not end up in .broken-div
    const template2 = html`${template1} more text. </div>`;
    ```
