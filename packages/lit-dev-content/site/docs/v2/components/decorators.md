---
title: Decorators
eleventyNavigation:
  key: Decorators
  parent: Components
  order: 8
versionLinks:
  v1: components/decorators/
  v3: components/decorators/
---

Decorators are special functions that can modify the behavior of classes, class methods, and class fields. Lit uses decorators to provide declarative APIs for things like registering elements, reactive properties, and queries.

Decorators are a [stage 3 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard. Currently no browsers implement decorators, but compilers like [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) provide support for an earlier version of the decorators proposal. Lit decorators work with Babel and TypeScript, and will be updated to work with the final specification when it's implemented in browsers.

See the [Enabling decorators](#enabling-decorators) section for more information.

{% aside "info" %}

What does stage 3 mean?

Stage 3 means that the specification text is complete, and ready for browsers to implement. Once the specification has been implemented in multiple browsers, it can move to the final stage, stage 4, and be added to the ECMAScript standard. A stage 3 proposal can still change, but only if critical issues are discovered during implementation.

{% endaside %}



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

See [Reactive properties](/docs/v2/components/properties/) for more information about configuring properties.

## Built-in decorators

| Decorator | Summary | More Info |
|-----------|---------|--------------|
| {% api "@customElement" "customElement" %} | Defines a custom element | [Above](#custom-element) |
| {% api "@eventOptions" "eventOptions" %} | Adds event listener options. | [Events](/docs/v2/components/events/#event-options-decorator) |
| {% api "@property" "property" %} | Defines a public property. | [Properties](/docs/v2/components/properties/#declare-with-decorators) |
| {% api "@state" "state" %} | Defines a private state property | [Properties](/docs/v2/components/properties/#declare-with-decorators) |
| {% api "@query" "query" %} | Defines a property that returns an element in the component template. | [Shadow DOM](/docs/v2/components/shadow-dom/#query) |
| {% api "@queryAll" "queryAll" %} | Defines a property that returns a list of elements in the component template. | [Shadow DOM](/docs/v2/components/shadow-dom/#query-all) |
| {% api "@queryAsync" "queryAsync" %} | Defines a property that returns a promise that resolves to an element in the component template. | [Shadow DOM](/docs/v2/components/shadow-dom/#query-async) |
| {% api "@queryAssignedElements" "queryAssignedElements" %} | Defines a property that returns the child elements assigned to a specific slot. | [Shadow DOM](/docs/v2/components/shadow-dom/#query-assigned-nodes) |
| {% api "@queryAssignedNodes" "queryAssignedNodes" %} | Defines a property that returns the child nodes assigned to a specific slot. | [Shadow DOM](/docs/v2/components/shadow-dom/#query-assigned-nodes) |

## Importing decorators

You can import all the lit decorators via the `lit/decorators.js` module:

```js
import {customElement, property, eventOptions, query} from 'lit/decorators.js';
```

To reduce the amount of code needed to run the component, decorators can be imported individually into component code. All decorators are available at `lit/decorators/<decorator-name>.js`. For example,

```js
import {customElement} from 'lit/decorators/custom-element.js';
import {eventOptions} from 'lit/decorators/event-options.js';
```

## Enabling decorators { #enabling-decorators }

To use decorators, you need to build your code with a compiler such as [TypeScript](#decorators-typescript) or [Babel](#decorators-babel).

In the future when decorators become a native web platform feature, this may no longer be necessary.

### Using decorators with TypeScript { #decorators-typescript }

To use decorators with [TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html), enable the `experimentalDecorators` compiler option.

You should also ensure that the `useDefineForClassFields` setting is `false`. Note, this should only be required when the `target` is set to `esnext` or greater, but it's recommended to explicitly ensure this setting is `false`.

```json
"experimentalDecorators": true,
"useDefineForClassFields": false,
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

### Using decorators with Babel  { #decorators-babel }

If you're compiling JavaScript with [Babel](https://babeljs.io/docs/en/), you can enable decorators by adding the following plugins and settings:

*   [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)
*   [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

Note, the `@babel/plugin-proposal-class-properties` may not be required with the latest versions of Babel.

To set up the plugins, add code like this to your Babel configuration:

```json
"assumptions": {
  "setPublicClassFields": true
},
"plugins": [
  ["@babel/plugin-proposal-decorators", {
    "version": "2018-09",
    "decoratorsBeforeExport": true
  }],
  ["@babel/plugin-proposal-class-properties"]
]
```

<div class="alert alert-info">

Babel decorator support has been tested with `version: '2018-09'`. This is currently the default, but we recommend setting the version explicitly in case the default changes. Other versions ('2021-12' or 'legacy') are not supported, but this may change as Babel evolves. See the [Babel documentation](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#options) if you want to experiment.

</div>

### Using decorators with TypeScript and Babel

When using TypeScript with Babel, it's important to order the TypeScript transform before the decorators transform in your Babel config as follows:

```json
{
  "assumptions": {
    "setPublicClassFields": true
  },
  "plugins": [
    ["@babel/plugin-transform-typescript", {
      "allowDeclareFields": true
    }],
    ["@babel/plugin-proposal-decorators", {
      "version": "2018-09",
      "decoratorsBeforeExport": true
    }],
    ["@babel/plugin-proposal-class-properties"]
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

### Avoiding issues with class fields and decorators {#avoiding-issues-with-class-fields}

[Class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) have a problematic interaction with declaring reactive properties. See [Avoiding issues with class fields when declaring properties](/docs/v2/components/properties/#avoiding-issues-with-class-fields) for more information.

The current decorators [stage 3 proposal](https://github.com/tc39/proposal-decorators) does not directly address this issue, but it should be solved as the proposal evolves and matures.

When using decorators, transpiler settings for Babel and TypeScript must be configured correctly as shown in the sections above for [TypeScript](#decorators-typescript) and [Babel](#decorators-babel).
