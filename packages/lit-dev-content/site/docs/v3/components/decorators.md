---
title: Decorators
eleventyNavigation:
  key: Decorators
  parent: Components
  order: 8
versionLinks:
  v1: components/decorators/
  v2: components/decorators/
---

Decorators are functions that can be used to declaratively annotate and modify the behavior of classes.

Lit provides a set of decorators that enable declarative APIs for things like registering elements, defining reactive properties and query properties, or adding event options to event handler methods.

For example, the `@customElement` and `@property()` decorators let you register a custom element and define a reactive property in a compact, declarative way:

```ts
@customElement('my-element')
export class MyElement extends LitElement {

  @property() greeting = 'Welcome';

}
```

Decorators are a [stage 3 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard. Compilers like [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) support decorators, though no browsers have implemented them yet. Lit decorators work with Babel and TypeScript, and will work in browsers when they implement them natively.

Previous versions of the decorators proposal are also supported by some compilers, most notably TypeScript's "experimental decorators" which Lit has supported since it's inception.

Lit decorators work with both TypeScript experimental decorators and standard decorators. We currently recommend that TypeScript users use experimental decorators because the compiler output is much smaller than for experimental decorators.

This means that TypeScript-based Lit projects should have `"experimentalDecorators": true` in their tsconfig.

See the [Enabling decorators](#enabling-decorators) section for more information.

{% aside "info" %}

What does stage 3 mean?

Stage 3 means that the specification text is complete, and ready for browsers to implement. Once the specification has been implemented in multiple browsers, it can move to the final stage, stage 4, and be added to the ECMAScript standard. A stage 3 proposal can still change, but only if critical issues are discovered during implementation.

{% endaside %}

{#custom-element}

The `@customElement` decorator defines a custom element, equivalent to calling:

```js
customElements.define('my-element', MyElement);
```

The `@property` decorator declares a reactive property.

See [Reactive properties](/docs/v3/components/properties/) for more information about configuring properties.

## Built-in decorators

| Decorator | Summary | More Info |
|-----------|---------|--------------|
| {% api-v3 "@customElement" "customElement" %} | Defines a custom element | [Above](#custom-element) |
| {% api-v3 "@eventOptions" "eventOptions" %} | Adds event listener options. | [Events](/docs/v3/components/events/#event-options-decorator) |
| {% api-v3 "@property" "property" %} | Defines a public property. | [Properties](/docs/v3/components/properties/#declare-with-decorators) |
| {% api-v3 "@state" "state" %} | Defines a private state property | [Properties](/docs/v3/components/properties/#declare-with-decorators) |
| {% api-v3 "@query" "query" %} | Defines a property that returns an element in the component template. | [Shadow DOM](/docs/v3/components/shadow-dom/#query) |
| {% api-v3 "@queryAll" "queryAll" %} | Defines a property that returns a list of elements in the component template. | [Shadow DOM](/docs/v3/components/shadow-dom/#query-all) |
| {% api-v3 "@queryAsync" "queryAsync" %} | Defines a property that returns a promise that resolves to an element in the component template. | [Shadow DOM](/docs/v3/components/shadow-dom/#query-async) |
| {% api-v3 "@queryAssignedElements" "queryAssignedElements" %} | Defines a property that returns the child elements assigned to a specific slot. | [Shadow DOM](/docs/v3/components/shadow-dom/#query-assigned-nodes) |
| {% api-v3 "@queryAssignedNodes" "queryAssignedNodes" %} | Defines a property that returns the child nodes assigned to a specific slot. | [Shadow DOM](/docs/v3/components/shadow-dom/#query-assigned-nodes) |

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

## Standard decorators { #standard-decorators }

"Standard decorators" is the version of decorators that has reached Stage 3 consensus at TC39, the body that defines ECMAScript/JavaScript. The decorators specification has been fine-tuned with active VM implementor feedback to be as optimizable as possible.

Standard decorators are supported in TypeScript and Babel, with native browser coming in the near future.

The biggest difference between using standard decorators and experimental decorators is that, for performance reasons, standard decorators cannot change the _kind_ of a class member - fields, accessors, and methods can be decorated and replaced, but only with the same kind of member.

Since many Lit decorators generate accessors, this means that the decorators need to be applied to accessors, not class fields.

To make this convenient, the standard decorator specification adds the `accessor` keyword to declare "auto-accessors":

```ts
class MyClass {
  accessor foo = 42;
}
```

Auto-accessors create a getter and setter pair that read and write from a private field. Decorators can then wrap these getters and setters.

Lit decorators that work on class fields with experimental decorators - such as `@property()`, `@state()`, `@query()`, etc. - must be applied to accessors or auto-accessors with standard decorators:

```ts
@customElement('my-element')
export class MyElement extends LitElement {

  @property() accessor greeting = 'Welcome';

}
```

### Compiler output considerations

Compiler output for standard decorators is unfortunately large due to the need to generate the accessors, private storage and other objects that are part of the decorators API.

So we recommend that users who wish to use decorators continue to use TypeScript experimental decorators for now.

In the future the Lit team plans on adding decorator transforms to our optional Lit Compiler in order to compile standard decorators to a more compact compiler output. Native browser support will also eliminate the need for any compiler transforms at all.

## Enabling decorators { #enabling-decorators }

To use decorators, you need to build your code with a compiler such as [TypeScript](#decorators-typescript) or [Babel](#decorators-babel).

In the future when decorators become a native web platform feature, this may no longer be necessary.

### Using decorators with TypeScript { #decorators-typescript }

TypeScript supports both experimental decorators and standard decorators. Standard decorators are enabled by default in TypeScript 5.0 and later, though Lit requires decorator metadata, which is available TypeScript 5.2 and later.

We recommend that TypeScript developers use experimental decorators for now for optimal compiler output.

To use experimental decorators you must enable the `experimentalDecorators` compiler option.

You should also ensure that the `useDefineForClassFields` setting is `false`. Note, this should only be required when the `target` is set to `esnext` or greater, but it's recommended to explicitly ensure this setting is `false`.

```json
"experimentalDecorators": true,
"useDefineForClassFields": false,
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

### Using decorators with Babel { #decorators-babel }

[Babel](https://babeljs.io/docs/en/) supports standard decorators with the [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) plugin. Babel does not support TypeScript experimental decorators, so you must use Lit decorators in standard decorator mode with the `accessor` keyword on decorated class fields.

You can enable decorators by adding [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) with these Babel configuration settings:

```json
"plugins": [
  ["@babel/plugin-proposal-decorators", {
    "version": "2023-05"
  }]
]
```

<div class="alert alert-info">

Lit decorators only work with `version: "2023-05"`. Other versions (`"2021-12"` or `"legacy"`) are not supported.

</div>

### Using decorators with TypeScript and Babel

When using Babel to compile TypeScript sources, it's important to order the TypeScript transform before the decorators transform in your Babel config as follows:

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

Standard [Class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) have a problematic interaction with declaring reactive properties. See [Avoiding issues with class fields when declaring properties](/docs/v3/components/properties/#avoiding-issues-with-class-fields) for more information.

When using decorators, transpiler settings for Babel and TypeScript must be configured correctly as shown in the sections above for [TypeScript](#decorators-typescript) and [Babel](#decorators-babel).
