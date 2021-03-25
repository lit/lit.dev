---
title: Working with Shadow DOM
eleventyNavigation:
  key: Shadow DOM
  parent: Components
  order: 4
---

Lit components use [shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom) to encapsulate their DOM. Shadow DOM provides a way to add a separate isolated and encapsulated DOM tree to an element. DOM encapsulation is the key to unlocking interoperability with any other code, including other web components or Lit component, functioning on the page.

Shadow DOM provides three benefits:

* DOM scoping. DOM APIs like `document.querySelector` won't find elements in the
  component's shadow DOM, so it's harder for global scripts to accidentally break your component.
* Style scoping. You can write encapsulated styles for your shadow DOM that don't
  affect the rest of the DOM tree.
* Composition. The component's shadow root, which contains its internal DOM, is separate from the component's children. You can choose how children are rendered in your component's internal DOM.

For more information on shadow DOM:

* [Shadow DOM v1: Self-Contained Web Components](https://developers.google.com/web/fundamentals/web-components/shadowdom) on Web Fundamentals.
* [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) on MDN.


<div class="alert alert-info">

**Older browsers.** On older browsers where native shadow DOM isn't available, the [web components polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) can be used to polyfill shadow DOM. See the [Polyfills](/docs/tools/requirements/#polyfills) documentation for more information.

</div>

## Accessing nodes in the shadow DOM


Lit renders components to its `renderRoot`, which is a shadow root by default. To find internal elements, you can use DOM query APIs, such as `this.renderRoot.querySelector()`.

The `renderRoot` should always be either a shadow root or an element. Both implement the [`ParentNode`](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode) interface and share API like `.querySelectorAll()` and `.children`.

You can query internal DOM after component initial render (for example, in `firstUpdated`), or use a getter pattern:

```js
firstUpdated() {
  this.staticNode = this.renderRoot.querySelector('#static-node');
}

get _closeButton() {
  return this.renderRoot.querySelector('#close-button');
}
```

LitElement supplies a set of decorators that provide a shorthand way of defining getters like this.

### @query, @queryAll, and @queryAsync decorators

The `@query`, `@queryAll`, and `@queryAsync` decorators all provide a convenient way to access nodes in the internal component DOM.

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you’ll need to use a compiler like Babel or TypeScript to use decorators. See [Using decorators](/docs/components/decorators/) for details.

</div>

#### @query { #query }

Modifies a class property, turning it into a getter that returns a node from the render root. The optional second argument when true performs the DOM query only once and caches the result. This can be used as a performance optimization in cases when the node being queried will not change.

```js
import {LitElement, html} from 'lit';
import {query} from 'lit/decorators/query.js';

class MyElement extends LitElement {
  @query('#first')
  _first;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

This decorator is equivalent to:

```js
get first() {
  return this.renderRoot.querySelector('#first');
}
```

#### @queryAll { #query-all }

Identical to `query` except that it returns all matching nodes, instead of a single node. It's the equivalent of calling `querySelectorAll`.

```js
import {LitElement, html} from 'lit';
import {queryAll} from 'lit/decorators/queryAll.js';

class MyElement extends LitElement {
  @queryAll('div')
  _divs;

  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>
    `;
  }
}
```

Here, `_divs` would return both `<div>` elements in the template. For TypeScript, the typing of a `@queryAll` property is `NodeListOf<HTMLElement>`. If you know exactly what kind of nodes you'll retrieve, the typing can be more specific:

```js
@queryAll('button')
_buttons!: NodeListOf<HTMLButtonElement>
```

The exclamation point (`!`) after `buttons` is TypeScript's [non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator). It tells the compiler to treat `buttons` as always being defined, never `null` or `undefined`.

#### @queryAsync { #query-async }

Similar to `@query`, except that instead of returning a node directly, it returns a `Promise` that resolves to that node after any pending element render is completed. Code can use this instead of waiting for the `updateComplete` promise.

This is useful, for example, if the node returned by `@queryAsync` can change as a result of another property change.

## Rendering children with slots {#slots}

Your component may accept children (like a `<ul>` element can have `<li>` children).

```html
<my-element>
  <p>A child</p>
</my-element>
```
By default, if an element has a shadow tree, its children don't render at all.

To render children, your template needs to include one or more [`<slot>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot), which act as placeholders for child nodes.

### Using the slot element

To render an element's children, create a `<slot>` for them in the element's template. The children aren't _moved_ in the DOM tree, but they're rendered _as if_ they were children of the `<slot>`. For example:

{% playground-ide "docs/components/shadowdom/slots/" %}

### Using named slots

To assign a child to a specific slot, ensure that the child's `slot` attribute matches the slot's `name` attribute:

* **Named slots only accept children with a matching `slot` attribute.**

  For example, `<slot name="one"></slot>` only accepts children with the attribute `slot="one"`.

* **Children with a `slot` attribute will only be rendered in a slot with a matching `name` attribute.**

  For example, `<p slot="one">...</p>` will only be placed in `<slot name="one"></slot>`.

{% playground-ide "docs/components/shadowdom/namedslots/" %}

### Specifying slot fallback content

You can specify fallback content for a slot. The fallback content is shown when no child is assigned to the slot.

```html
<slot>I am fallback content</slot>
```

<div class="alert alert-info">

**Rendering fallback content.** If any child nodes are assigned to a slot, its fallback content doesn't render. A default slot with no name accepts any child nodes. It won't render fallback content even if the only assigned nodes are text nodes containing whitespace, for example `<example-element> </example-element>`.

</div>

## Accessing slotted children { #accessing-slotted-children }

To access children assigned to slots in your shadow root, you can use the standard `slot.assignedNodes` method and the `slotchange` event.

For example, you can create a getter to access assigned nodes for a particular slot:

```js
get _slottedChildren() {
  const slot = this.shadowRoot.querySelector('slot');
  const childNodes = slot.assignedNodes({flatten: true});
  return Array.prototype.filter.call(childNodes, (node) => node.nodeType == Node.ELEMENT_NODE);
}
```

You can also use the `slotchange` event to take action when the assigned nodes change. The following example extracts the text content of all of the slotted children.

```js
handleSlotchange(e) {
  const childNodes = e.target.assignedNodes({flatten: true});
  // ... do something with childNodes ...
  this.allText = Array.prototype.map.call(childNodes, (node) => {
    return node.textContent ? node.textContent : ''
  }).join('');
}

render() {
  return html`<slot @slotchange=${this.handleSlotchange}></slot>`;
}
```

For more information, see [HTMLSlotElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement) on MDN.

### @queryAssignedNodes decorator { #query-assigned-nodes }

The `@queryAssignedNodes` decorator converts a class property into a getter that returns all of the assigned nodes for a given slot in the component's shadow tree. The optional second boolean argument when true flattens the assigned nodes, meaning any assigned nodes that are slot elements are replaced with their assigned nodes. The optional third argument is a css selector which filters the results to matching elements.

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you’ll need to use a compiler like Babel or TypeScript to use decorators. See [Using decorators](/docs/components/decorators/) for details.

</div>

```js
// First argument is the slot name
// Second argument is `true` to flatten the assigned nodes.
@queryAssignedNodes('header', true)
_headerNodes;

// If the first argument is absent or an empty string, list nodes for the default slot.
@queryAssignedNodes()
_defaultSlotNodes;
```

The first example above is equivalent to the following code:

```js
get headerNodes() {
  const slot = this.shadowRoot.querySelector('slot[name=header]');
  return slot.assignedNodes({flatten: true});
}
```

For TypeScript, the typing of a `queryAssignedNodes` property is `NodeListOf<HTMLElement>`.

## Customizing the render root {#renderroot}

Each Lit component has a **render root**—a DOM node that serves as a container for its internal DOM.

By default, LitElement creates an open `shadowRoot` and renders inside it, producing the following DOM structure:

```html
<my-element>
  #shadow-root
    <p>child 1</p>
    <p>child 2</p>
```

There are two ways to customize the render root use by LitElement:

* Setting `shadowRootOptions`.
* Implementing the `createRenderRoot` method.

### Setting `shadowRootOptions`

The simplest way to customize the render root is to set the `shadowRootOptions` static property. The default implementation of `createRenderRoot` passes `shadowRootOptions` as the options argument to `attachShadow` when creating the component's shadow root. It can be set to customize any options allowed in the [ShadowRootInit](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters) dictionary, for example `mode` and `delegatesFocus`.

```js
class DelagatesFocus extends LitElement {
  static shadowRootOptions = {...super.shadowRootOptions, delegatesFocus: true};
}
```

See [Element.attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow) on MDN for more information.

### Implementing `createRenderRoot`

The default implementation of `createRenderRoot` creates an open shadow root and adds to it any styles set in the `static styles` property. For more information on styling see [Styles](/docs/components/styles/).

To customize a component's render root, implement `createRenderRoot` and return the node you want the template to render into.

For example, to render the template into the main DOM tree as your element's children, implement `createRenderRoot` and return `this`.

<div class="alert alert-info">

**Rendering into children.** Rendering into children and not shadow DOM is generally not recommended. Your element will not have access to DOM or style scoping, and it will not be able to compose elements into its internal DOM.

</div>

{% playground-ide "docs/components/shadowdom/renderroot/" %}
