---
title: Using decorators
eleventyNavigation:
  key: Decorators
  parent: Components
  order: 6
versionLinks:
  v2: components/decorators/
  v3: components/decorators/
---

Decorators are special expressions that can alter the behavior of class, class method, and class field declarations. LitElement supplies a set of decorators that reduce the amount of boilerplate code you need to write when defining a component.

For example, the `@customElement` and `@property` decorators make a basic element definition more compact:

```js
import {LitElement, html, customElement, property} from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {

 // Declare observed properties
 @property()
 adjective = 'awesome';

 // Define the element's template
 render() {
   return html`<p>your ${this.adjective} template here</p>`;
 }
}
```

The `@customElement` decorator defines a custom element, equivalent to calling:

```js
customElements.define('my-element', MyElement);
```

The `@property` decorator declares a reactive property. The lines:

```js
 @property()
 adjective = 'awesome';
```

Are equivalent to:

```js
static get properties() {
  return {
    adjective: {}
  };
}

constructor() {
  this.adjective = 'awesome';
}
```

## Enabling decorators

To use decorators, you need to use a compiler such as Babel or the TypeScript compiler.

<div class="alert alert-info">

**The decorators proposal**. Decorators are a <a href="https://github.com/tc39/proposal-decorators" target="_blank" rel="noopener">stage 2 proposal</a> for addition to the ECMAScript standard, which means they're neither finalized nor implemented in browsers yet. Compilers like Babel and TypeScript provide support for proposed features like decorators by compiling them into standard JavaScript a browser can run.

</div>

### To use decorators with TypeScript

To use decorators with <a href="https://www.typescriptlang.org/docs/handbook/decorators.html" target="_blank" rel="noopener">TypeScript</a>, enable the `experimentalDecorators` compiler option.

```json
"experimentalDecorators": true,
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

### To use decorators with Babel

If you're compiling JavaScript with <a href="https://babeljs.io/docs/en/" target="_blank" rel="noopener">Babel</a>, you can enable decorators by adding  the following plugins:

*   <a href="https://babeljs.io/docs/en/babel-plugin-proposal-decorators" target="_blank" rel="noopener">`@babel/plugin-proposal-decorators`</a>.
*   <a href="https://babeljs.io/docs/en/babel-plugin-proposal-class-properties" target="_blank" rel="noopener">`@babel/plugin-proposal-class-properties`</a>

To enable the plugins, you'd add code like this to your Babel configuration:

```js
plugins = [
  '@babel/plugin-proposal-class-properties',
  ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}],
];
```

## LitElement decorators

LitElement provides the following decorators:

*   {% api-lit-element-2 "@customElement" %}. Define a custom element.
*   {% api-lit-element-2 "@eventOptions" %}. Add event listener options for a declarative event listener.
*   {% api-lit-element-2 "@property" %} and {% api-lit-element-2 "@internalProperty" %}. Define properties.
*   {% api-lit-element-2 "@query" %}, {% api-lit-element-2 "@queryAll" %}, and {% api-lit-element-2 "@queryAsync" %}. Create a property getter that returns specific elements from your component's render root.
*   {% api-lit-element-2 "@queryAssignedNodes" %}. Create a property getter that returns the children assigned to a specific slot.


All of the decorators can be imported directly from the <code>lit-element</code> module.

```js
import {eventOptions} from 'lit-element';
```
