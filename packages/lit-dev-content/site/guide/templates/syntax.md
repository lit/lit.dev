---
title: Template syntax 
eleventyNavigation:
  key: Syntax
  parent: Templates
  order: 5
---

lit-html templates are written using JavaScript template literals tagged with the `html` tag. The contents of the literal are mostly plain, declarative, HTML:

```js
html`<h1>Hello World</h1>`
```

**Bindings** or expressions are denoted with the standard JavaScript syntax for template literals:

```js
html`<h1>Hello ${name}</h1>`
```

## Template Structure

Lit templates must be well-formed HTML, and bindings can only occur in certain places. The templates are parsed by the browser's built-in HTML parser before any values are interpolated. 

**No warnings.** Most cases of malformed templates are not detectable by Lit, so you won't see any warnings—just templates that don't behave as you expect—so take extra care to structure templates properly. 

Follow these rules for well-formed templates:

 *  Templates must be well-formed HTML when all expressions are replaced by empty values.

 *  Standard bindings **_can only occur_** in attribute-value and text-content positions.

    ```html
    <!-- attribute value -->
    <div label="${label}"></div>

    <!-- text content -->
    <div>${textContent}</div>
    ```

  * The special element binding can occur where an attribute would appear:

    ```html
    <!-- ERROR --> 
    <div ${elementBinding}></div>
    ```

 *  Bindings **_cannot_** appear where tag or attribute names would appear.
    
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

## Binding Types

Binding expressions can occur in text content or in attribute value positions. One special type of binding, the element binding, takes the place of an attribute.

There are a few types of bindings:

  * Text:

    ```js
    html`<h1>Hello ${name}</h1>`
    ```

    Text bindings can occur anywhere in the text content of an element.

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
  * Element:

    ```js
    html`<div ${elementBinding}></div>
    ```

### Event Listeners

Event listeners can be functions or objects with a `handleEvent` method. Listeners are passed as both the listener and options arguments to `addEventListener`/`removeEventListener`, so that the listener can carry event listener options like `capture`, `passive`, and `once`.

```js
const listener = {
  handleEvent(e) {
    console.log('clicked');
  },
  capture: true,
};

html`<button @click=${listener}>Click Me</button>`
```

### Element bindings

An _element binding_ is a special binding that binds to an element instance, instead of a single property or attribute on an element.

```js
html`<div ${myDirective}></div>`
```

Element bindings are special in a couple of ways:

*   They only work with directives. You can't use any other kind of value with an element binding.

*   A given element can only have a single element binding.

There are a few of built-in directives that can be used in element bindings. One example is the `ref` directive, which provides a reference to the rendered element. 

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

## Supported data types

Each binding type supports different types of values:

 * Text content bindings: Many types, see [Supported data types for text bindings](#supported-data-types-for-text-bindings).

 * Attribute bindings: All values are converted to strings.

 * Boolean attribute bindings: All values evaluated for truthiness.

 * Property bindings: Any type of value.

 * Event handler bindings: Event handler functions or objects only.

 * Element bindings: Directives only.

### Supported data types for text bindings

Text content bindings accept a large range of value types:

*   Primitive values.
*   TemplateResult objects.
*   DOM nodes.
*   Arrays or iterables.

#### Primitive Values: String, Number, Boolean, null, undefined

Primitives values are converted to strings when interpolated into text content or attribute values. They are checked for equality to the previous value so that the DOM is not updated if the value hasn't changed.

#### TemplateResult

Templates can be nested by passing a `TemplateResult` as a value of an expression:

```js
const header = html`<h1>Header</h1>`;

const page = html`
  ${header}
  <p>This is some text</p>
`;
```

#### Node

Any DOM Node can be passed to a text position expression. The node is attached to the DOM tree at that point, and so removed from any current parent:

```js
const div = document.createElement('div');
const page = html`
  ${div}
  <p>This is some text</p>
`;
```

#### Arrays / Iterables

Arrays and Iterables of supported types are supported as well. They can be mixed values of different supported types.

```javascript
const items = [1, 2, 3];
const list = () => html`items = ${items.map((i) => `item: ${i}`)}`;
```

```javascript
const items = {
  a: 1,
  b: 23,
  c: 456,
};
const list = () => html`items = ${Object.entries(items)}`;
```

