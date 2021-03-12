---
title: Decorators
eleventyNavigation:
  key: Decorators
  parent: Components
  order: 8
---

{% todo %}

* See [#175](https://github.com/PolymerLabs/lit.dev/issues/175)

{% endtodo %}

Decorators are special functions that can modify the behavior of classes, class methods, and class fields. Lit uses decorators to provide more declarative APIs for things like registering elements, reactive properties, and queries.

Decorators are a [stage 2 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard, which means they're neither finalized nor implemented in browsers yet. Compilers like [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) provide support for proposed features like decorators by compiling them into standard JavaScript a browser can run.

See the [Enabling decorators](#enabling-decorators) section for more information.

Lit supplies a set of decorators that reduce the amount of boilerplate code you need to write when defining a component. For example, the `@customElement` and `@property` decorators make a basic element definition more compact:

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  //...
}
```
{#custom-element}

The `@customElement` decorator defines a custom element, equivalent to calling:

```js
customElements.define('my-element', MyElement);
```

The `@property` decorator declares a reactive property.

See [Reactive properties](/guide/components/properties) for more information about configuring properties.

## Built-in decorators

| Decorator | Summary | More Info |
|-----------|---------|--------------|
| [`@customElement`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#customelement) | Defines a custom element | [Above](#custom-element) |
| [`@eventOptions`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#eventoptions) | Adds event listener options. | [Events](/guide/components/events#event-options-decorator) |
| [`@property`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#property) | Defines a public property. | [Properties](/guide/components/properties#declare-with-decorators) |
| [`@state`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#internalproperty) | Defines a private state property | [Properties](/guide/components/properties#declare-with-decorators) |
| [`@query`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#query) | Defines a property that returns an element in the component template. | [Shadow DOM](/guide/components/shadow-dom#query) |
| [`@queryAll`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#queryAll) | Defines a property that returns a list of elements in the component template. | [Shadow DOM](/guide/components/shadow-dom#query-all) |
| [`@queryAsync`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#queryAsync) | Defines a property that returns a promise that resolves to an element in the component template. | [Shadow DOM](/guide/components/shadow-dom#query-async) |
| [`@queryAssignedNodes`](https://lit-element.polymer-project.org/api/modules/_lit_element_.html#queryAssignedNodes) | Defines a property that returns the children assigned to a specific slot. | [Shadow DOM](/guide/components/shadow-dom#query-assigned-nodes) |

## Importing decorators

You can import all the lit decorators via the `lit/decorators.js` module:

```js
import {customElement, property, eventOptions, query} from 'lit/decorators.js';
```

To reduce the amount of code needed to run the component, decorators can be imported individually into component code. All decorators are available at `lit/decorators/<decorator-name>`. For example,

```js
import {customElement} from 'lit/decorators/custom-element.js';
import {eventOptions} from 'lit/decorators/event-options.js';
```

## Enabling decorators { #enabling-decorators }

To use decorators, you need to build your code with a compiler such as [TypeScript](#decorators-typescript) or [Babel](#decorators-babel).

In the future when decorators become a native web platform feature, this may no longer be necessary.

### Using decorators with TypeScript { #decorators-typescript }

To use decorators with [TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html), enable the `experimentalDecorators` compiler option.

```json
"experimentalDecorators": true,
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

### Using decorators with Babel  { #decorators-babel }

If you're compiling JavaScript with [Babel](https://babeljs.io/docs/en/), you can enable decorators by adding the following plugins:

*   [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators).
*   [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

To enable the plugins, add code like this to your Babel configuration:

```js
plugins = [
  ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}],
  ["@babel/plugin-proposal-class-properties", {"loose": true}],
];
```

<div class="alert alert-info">
Currently the older `legacy` mode of Babel decorators is not supported, but this may change as Babel evolves. See the [Babel documentation](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#legacy) if you want to experiment.
</div>

### Avoiding issues with class fields

Class fields are a [stage 3 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard. They currently have a problematic interaction with the decorators proposal in some circumstances.

There are generally no issues when using TypeScript. However, it's important to ensure that the `useDefineForClassFields` setting in your `tsconfig` is set to false. This is currently the default setting.

When using Babel, class fields should only be used for properties that are defined with a decorator.

<div class="alert alert-info">
Using the `static properties` syntax along with class fields is not supported.
</div>

The following is ok:

```js
@property()
foo = 'bar';
```

but this is **not supported**:

```js
static properties = { foo: {} };
foo = 'bar';
```

### Using TypeScript with Babel

When using TypeScript with Babel, it's important to order the TypeScript transform before the decorators transform in your Babel config as follows:

```js
{
  "plugins":[
    ["@babel/plugin-transform-typescript", {"allowDeclareFields": true}],
    ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
    ["@babel/plugin-proposal-class-properties", {"loose": true}],
  ]
}
```

The `allowDeclareFields` setting is generally not needed, but it can be useful if you want to define a reactive property without using a decorator. For example,

```ts
static properties = { foo: {} };

declare foo: string;

constructor() {
  super();
  this.foo = 'bar';
}
```
