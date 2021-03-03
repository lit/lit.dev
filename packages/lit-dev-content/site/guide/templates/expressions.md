---
title: Expressions
eleventyNavigation:
  key: Expressions
  parent: Templates
  order: 2
---

In addition to static [HTML](#well-formed-html), Lit templates can include dynamic values called expressions. An expression can be any JavaScript expression. The expression is evaluated when the template is evaluated, and the result of the expression is included when the template renders. In a Lit component, this means whenever the `render` method is called.

Expressions can only be placed in [specific locations](#expression-locations) in the template, and how an expression is interpreted depends on where it appears. Expressions inside the element tag itself affect the element. Expressions inside the element's content, where child nodes go, render child nodes or text.

Valid values for expressions differ based on where the expression occurs. Generally all expressions accept primitive values like strings and numbers, and some expressions support additional value types. In addition, all expressions can accept _directives_, which are special functions that customize the way an expression is processed and rendered. See [Directives](/guide/templates/directives) for more information.

Here's a quick reference followed by more detailed information about each expression type.

<table class="wide-table">
<thead>
<tr>
<th class="no-wrap-cell">Type</th>
<th class="wide-cell">Example</th>
</tr>
</thead>
<tbody>
<tr>
<td class="no-wrap-cell">

[Child nodes](#child-expressions)

</td>
<td>

```js
html`
<h1>Hello ${name}</h1>
<ul>
  ${listItems}
</ul>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Attributes](#attribute-expressions)

</td>
<td>

```js
html`<div class=${highlightClass}></div>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Boolean Attributes](#boolean-attribute-expressions)

</td>
<td>

```js
html`<div ?hidden=${!show}></div>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Properties](#property-expressions)

</td>
<td>

```js
html`<input .value=${value}>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Event listeners](#event-listener-expressions)

</td>
<td>

```js
html`<button @click=${this._clickHandler}>Go</button>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Element directives](#element-expressions)

</td>
<td>

  ```js
  html`<input ${ref(inputRef)}>`
  ```

</td>
</tr>
</tbody>
</table>

This basic example shows a variety of different kinds of expressions.

{% playground-example "docs/templates/expressions/basic" "my-element.ts" %}

## Child expressions { #child-expressions }

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

### Primitive values

Primitives values like strings, numbers, booleans, null, and undefined are converted to strings when interpolated into text content or attribute values. They are checked for equality with the previous value so the DOM is not updated if the value hasn't changed.

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

## Attribute expressions {#attribute-expressions }

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

## Boolean attributes {#boolean-attribute-expressions }

To set a boolean attribute, use the `?` prefix with the attribute name. The attribute is added if the expression evaluates to a truthy value, removed if it evaluates to a falsy value:

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

### Setting attributes if data is defined { #ifDefined }

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

## Property expressions {#property-expressions}

You can set a JavaScript property on an element using the `.` prefix and the property name:

```js
html`<input .value=${this.itemCount}></input>`;
```

You can use this syntax to pass complex data down the tree to subcomponents. For example, if you have a `my-list` component with a `listItems` property, you could pass it an array of objects:

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

Note that the property name in this example—`listItems`—is mixed case. Although HTML *attributes* are case-insensitive, Lit preserves the case for property names when it processes the template.

For more information about component properties, see [Reactive Properties](/guide/components/properties).

## Event listener expressions {#event-listener-expressions}

Templates can also include declarative event listeners. Use the prefix `@` followed by the event name. The expression should evaluate to an event listener.

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

This is similar to calling `addEventListener('click', this.clickHandler)` on the button element.

The event listener can be either a plain function, or an object with a `handleEvent` method——the same as the `listener` argument to the standard [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method.

In a Lit component, the event listener is automatically bound to the component, so you can use the `this` value inside the handler to refer to the component instance.

For more information about component events, see [Events](/guide/components/events).

```js
clickHandler() {
  this.clickCount++;
}
```

## Element expressions {#element-expressions}

You can also add an expression that accesses an element instance, instead of a single property or attribute on an element:

```js
html`<div ${myDirective()}></div>`
```

Element expressions only work with [directives](/guide/templates/directives). Any other value types in an element expression are ignored.

One built-in directive that can be used in an element expressions is the `ref` directive. It provides a reference to the rendered element.

```js
html`<button ${ref(this.myRef)}`;
```

See [ref](directives#ref) for more information.

## Well-formed HTML { #well-formed-html }

Lit templates must be well-formed HTML. The templates are parsed by the browser's built-in HTML parser before any values are interpolated. Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Templates can have multiple top-level elements and text.

 *  Templates _should not contain_ unclosed elements—they will be closed by the HTML parser.

    ```js
    // HTML parser closes this div after "Some text"
    const template1 = html`<div class="broken-div">Some text`;
    // When joined, "more text" does not end up in .broken-div
    const template2 = html`${template1} more text. </div>`;
    ```

<div class="alert alert-info">

Because the browser's built-in parser is very lenient, most cases of malformed templates are not detectable at runtime, so you won't see  warnings—just templates that don't behave as you expect. We recommend using <a href="/guide/tools/development/#linting">linting tools</a> and <a href="/guide/tools/development/#ide-plugins">IDE plugins</a> to find issues in your templates during development.

</div>

## Valid expression locations { #expression-locations }

Expressions **_can only occur_** where you can place attribute values and child elements in HTML.

```html
<!-- attribute values -->
<div label=${label}></div>
<button ?disabled=${isDisabled}>Click me!</button>
<input .value=${currentValue}>
<button @click=${this.handleClick()}>

<!-- child content -->
<div>${textContent}</div>
```

Element expressions can occur inside the opening tag after the tag name:

```html
<div ${ref(elementReference)}></div>
```

Expressions **_cannot_** appear where tag or attribute names would appear; however [static expressions](#static-expressions) can.

```html
<!-- ERROR -->
<${tagName}></${tagName}>

<!-- ERROR -->
<div ${attrName}=true></div>
```

 ## Static expressions { #static-expressions }

Static expressions are special one-time interpolations of values into the template that are not intended to be updated. Because they become part of the template's static HTML, they can exist anywhere in the template; however, when the static content is interpolated, the template must be [well-formed HTML](#well-formed-html).

To create static expressions, import Lit's `static-html` module. It contains special `html` and `svg` tag functions which support static expressions and should be used instead of the standard versions provided in the `lit` module. Use the `unsafeStatic()` function to create static expressions.

<div class="alert alert-info">

Note the use of _unsafe_ in `unsafeStatic()`. Creating static expressions should be considered unsafe from a security perspective, and therefore used with caution. To avoid potential [cross-site scripting](https://en.wikipedia.org/wiki/Cross-site_scripting) security issues, never allow user content to be an argument to `unsafeStatic()`.

</div>

You can use static expressions for configuration options that are unlikely to change or for customizing parts of the template you [cannot](#expression-locations) with normal expressions. For example, a `my-button` component might be renderable using either a `<button>` tag or an `<a>` tag. This is a good place to use a static expression because the setting is unlikely to change and customizing an HTML tag cannot be done with a normal expression.

```ts
tag = 'button';
activeAttribute = 'active';
@property() caption = 'Go';
@property({type: Boolean}) active = false;
protected render() {
  return html`
    <${unsafeStatic(this.tag)} ${unsafeStatic(this.activeAttribute)}?=${this.active}>
      <p>${this.caption}</p>
    </${unsafeStatic(this.tag)}>`;
}
```

The values passed to `unsafeStatic()` should not change frequently. In the example above, if the template re-renders and `this.caption` or `this.active` change, the template will update in the typical, [efficient Lit pattern](/guide/templates/overview#efficient-updates). However, if `this.tag` or `this.activeAttribute` change, since they are arguments to `unsafeStatic()`, an entirely new template will be created and the update will be inefficient since the DOM is completely re-rendered. In addition, changing values passed to `unsafeStatic()` increases memory use since each unique template is kept in memory.

For these reasons, it's a good idea keep changes to arguments to `unsafeStatic()` to a minimum and avoid using [reactive properties](/guide/components/properties) as arguments since they are intended to change.
