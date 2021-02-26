---
title: Expressions
eleventyNavigation:
  key: Expressions
  parent: Templates
  order: 2
---

A template expression is a way to embed dynamic values into a template. An expression can be any JavaScript expression. The expression is evaluated whenever the template is, and the result of the expression is included when the template renders. In a Lit component, this means whenever the `render` method is called.

{% playground-example "docs/templates/expressions/" "my-element.ts" %}

How an expression is interpreted depends on where it appears in the template.

**Child nodes**

These expressions render nodes or text in the DOM.

```js
html`
<h1>Hello ${name}</h1>
<ul>
  ${listItems}
</ul>`
```

**Attribute values**

These expressions set attributes.

```js
html`<div class=${highlightClass}></div>`
```

These expressions set boolean attributes.

```js
html`<div ?hidden=${!show}></div>`
```

**Properties**

These expressions set properties.

```js
html`<input .value=${value}>`
```

**Event listeners**

These expressions set event listeners.

```js
html`<button @click=${(e) => console.log('clicked')}>Click Me</button>`
```

**Element references**

These expressions must be directives, and they can be used, for example, to access the element itself.

```js
html`<input ${ref(inputRef)}>`
```


## Child expressions

An expression that occurs between the start and end tags of an element can add child nodes to the element. For example:

```js
html`<p>Hello, ${name}</p>`
```

Or:

```js
html`<main>${bodyText}</main>`
```

Expressions in the child position can take many kinds of values:

* Primitive values likes strings, numbers, and booleans
* `TemplateResult` objects created with the `html` function.
* DOM nodes
* Arrays or iterables of any of the supported types

### Primitive values: String, Number, Boolean, null, undefined

Primitives values are converted to strings when interpolated into text content or attribute values. They are checked for equality with the previous value so the DOM is not updated if the value hasn't changed.

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

For more on conditionals, see [Conditional templates](conditionals).

For more on using JavaScript to create repeating templates, see [Lists & repeating templates](lists).

### DOM nodes

Any DOM node can be passed to a child expression. Typically DOM nodes should be rendered by specifying a template using `html`, but a DOM node can be directly rendered like this when needed. The node is attached to the DOM tree at that point, and so removed from any current parent:

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

## Setting attributes

In addition to using expressions to add child nodes, you can use them to set an elements's attributes and properties, too.

By default, an expression in the value of an attribute sets the attribute:

```js
html`<div class=${this.textClass}>Stylish text.</div>`;
```

Since attribute values are always strings, the expression should return a value that can be converted into a string.

If the expression makes up the entire attribute value, you can leave off the quotes. If the expression makes up only part of the attribute value, you need to quote the entire value:

```js
html`<img src="/images/${this.image}">`;
```

To set a boolean attribute, use the `?` prefix with the attribute name. The attribute is added if the expression evaluates to a truthy value, removed if it evaluates to a falsy value:

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

### Setting values only if data is defined { #ifDefined }

Sometimes you want to set an attribute only if a value or set of values is available, and otherwise remove the attribute. For example, consider:

```js
html`<img src="/images/${this.imagePath}/${this.imageFile}">`;
```

If `this.imagePath` or `this.imageFile` is not defined, the `src` attribute should not be set or an invalid network request will occur.

You can use the `ifDefined` function to avoid this issue:

```js
html`<img src="/images/${ifDefined(this.imagePath)}/${ifDefined(this.imageFile)}">`;
```

In this example **both** the `this.imagePath` and `this.imageFile` properties must be defined for the `src` attribute to be set. A value is considered defined if it is not `null` or `undefined`.

## Property expressions

You can set a JavaScript property on an element using the `.` prefix and the property name:

```js
html`<input .value=${this.itemCount}></input>`;
```

You can use this syntax to pass complex data down the tree to subcomponents. For example, if you have a `my-list` component with a `listItems` property, you could pass it an array of objects:

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

Note that the property name in this example—`listItems`—is mixed case. Although HTML *attributes* are case-insensitive, Lit preserves the case for property names when it processes the template.

## Adding event listeners

Templates can also include declarative event listeners. Use the prefix `@` followed by the event name. The expression should evaluate to an event listener.

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

## Using Directives

Lit allows special functions, called _directives_, to customize the way an expression is processed and rendered. Lit provides some built-in directives, or you can write your own.

For example, the `classMap` directive lets you specify a set of CSS classes based on the keys and values of a Javascript object:

```js
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
// ...
render() {
  const classes = {
    active: true,
    highlighted: true,
    error: false
  };

  return html`<div class=${classMap(classes)}>...</div>`;
}
```

For a list of directives provided with Lit including [`classMap`](directives#classmap) shown above, see [Built-in directives](directives). For information on writing custom directives, see [Custom directives](../composition/directives).

## Element expressions

You can also add an expression that accesses an element instance, instead of a single property or attribute on an element:

```js
html`<div ${myDirective()}></div>`
```

Element expressions only work with directives. Any other value types in an element expression are ignored.

There are a few built-in directives that can be used in element expressions. One example is the `ref` directive, which provides a reference to the rendered element.

```js
html`<button ${ref(this.myRef)}`;
```

See [ref](directives#ref) for more information.

## Well-formed templates

Lit templates must be well-formed HTML, and expressions can only occur in certain places. The templates are parsed by the browser's built-in HTML parser before any values are interpolated.

<div class="alert alert-info">

**Finding malformed templates.** Because the browser's built-in parser is very lenient, most cases of malformed templates are not detectable at runtime, so you won't see  warnings—just templates that don't behave as you expect. We recommend using <a href="/guide/tools/development/#linting">linting tools</a> and <a href="/guide/tools/development/#ide-plugins">IDE plugins</a> to find issues in your templates during development.

</div>

Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Standard expressions **_can only occur_** where you can place attribute values and child elements in HTML.

    ```html
    <!-- attribute values -->
    <div label=${label}></div>
    <button ?disabled=${isDisabled}>Click me!</button>
    <input .value=${currentValue}>
    <button @click=${this.handleClick()}>

    <!-- child content -->
    <div>${textContent}</div>
    ```

  * Element expressions can occur inside the opening tag after the tag name:

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

    See [unsafeStatic()](/guide/templates/static) for information about rendering static html in templates.

 *  Templates can have multiple top-level elements and text.

 *  Templates **_should not contain_** unclosed elements—they will be closed by the HTML parser.

    ```js
    // HTML parser closes this div after "Some text"
    const template1 = html`<div class="broken-div">Some text`;
    // When joined, "more text" does not end up in .broken-div
    const template2 = html`${template1} more text. </div>`;
    ```
