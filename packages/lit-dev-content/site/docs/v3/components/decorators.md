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

  @property()
  greeting = 'Welcome';

}
```

{#custom-element}

The `@customElement` decorator defines a custom element, equivalent to calling:

```js
customElements.define('my-element', MyElement);
```

The `@property` decorator declares a [reactive property](/docs/v3/components/properties/).

{% aside "info" %}

Decorator versions and syntax.

Lit decorators support multiple versions of the decorator specification – TypeScript experimental decorators and standard decorators – but to be used as standard decorators require a newer syntax of using the `accessor` keyword on decorated properties.

We recommend that TypeScript users stick with experimental decorators for the moment, and as such, all of our TS code samples contain syntax that work in that mode, _without_ the `accessor` keyword.

If you are using Babel to compile decorators, or are required to use `"experimentalDecorators": false` in your TypeScript config, you will need to add those. See [Standard decorators](#standard-decorators) for more information.

{% endaside %}

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

You can import all of the Lit decorators via the `lit/decorators.js` module:

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

TypeScript supports both experimental decorators and standard decorators. We recommend that TypeScript developers use experimental decorators for now for optimal compiler output.

To use experimental decorators you must enable the `experimentalDecorators` compiler option.

You should also ensure that the `useDefineForClassFields` setting is `false`. Note, this is only be required when the `target` is set to `ES2022` or greater, but it is recommended to explicitly set this to `false`.

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

#### Migrating TypeScript experimental decorators to standard decorators { #migrating-typescript-standard-decorators }

Lit decorators have been designed to support standard decorator syntax (using `accessor` on class field decorators) with TypeScript's experimental decorator mode.

This allows incremental migration off of experimental decorators by adding the `accessor` keyword to decorated properties without a change of behavior. Once all class field decorators use the `accessor` keyword, you can change your `tsconfig.json` completing the migration to standard decorators:

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "useDefineForClassFields": true
  }
}
```

Note: The `accessor` keyword was introduced in TypeScript 4.9 and full standard decorator with metadata support requires TypeScript 5.2 or greater.

Read more about the code changes required to migrate to standard decorators in [the upgrade guide](/docs/v3/releases/upgrade/#standard-decorator-migration).

### Using decorators with Babel { #decorators-babel }

[Babel](https://babeljs.io/docs/en/) supports standard decorators with the [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) plugin as of version 7.23. Babel does not support TypeScript experimental decorators, so you must use Lit decorators in [standard decorator mode with the `accessor` keyword](#standard-decorators) on decorated class fields.

You can enable decorators by adding [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) with these Babel configuration settings:

```json
"plugins": [
  ["@babel/plugin-proposal-decorators", {
    "version": "2023-05"
  }]
]
```

Note: Lit decorators only work with `"version": "2023-05"`. Other versions, including the formerly supported `"2018-09"`, are not supported.

### Avoiding issues with class fields and decorators {#avoiding-issues-with-class-fields}

Standard [class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) have a problematic interaction with declaring reactive properties. See [Avoiding issues with class fields when declaring properties](/docs/v3/components/properties/#avoiding-issues-with-class-fields) for more information.

When using decorators, transpiler settings for Babel and TypeScript must be configured correctly as shown in the sections above for [TypeScript](#decorators-typescript) and [Babel](#decorators-babel).

## Decorator versions

Decorators are a [stage 3 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard. Compilers like [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) support decorators, though no browsers have implemented them yet. Lit decorators work with Babel and TypeScript, and will work in browsers when they implement them natively.

{% aside "info" %}

What does stage 3 mean?

It means that the specification text is complete, and ready for browsers to implement. Once the specification has been implemented in multiple browsers, it can move to the final stage, stage 4, and be added to the ECMAScript standard. A stage 3 proposal will only change if critical issues are discovered during implementation.

{% endaside %}

### Earlier decorators

Before the TC39 proposal reached stage 3, compilers implemented earlier versions of the decorator specification.

Most notable of these is [TypeScript's "experimental decorators"](https://www.typescriptlang.org/docs/handbook/decorators.html) which Lit has supported since its inception and is our current recommendation for use.

Babel has also supported different versions of the specification over time as can be seen from the [`"version"` option of the decorator plugin](https://babeljs.io/docs/babel-plugin-proposal-decorators#version). In the past, Lit 2 has supported the `"2018-09"` version for Babel users but that has now been dropped in favor of the "standard" `"2023-05"` version described below.

### Standard decorators { #standard-decorators }

"Standard decorators" is the version of decorators that has reached Stage 3 consensus at TC39, the body that defines ECMAScript/JavaScript.

Standard decorators are supported in TypeScript and Babel, with native browser coming in the near future.

The biggest difference between standard decorators and earlier versions of the decorators is that, for performance reasons, standard decorators cannot change the _kind_ of a class member – fields, accessors, and methods – being decorated and replaced, and will only produce the same kind of member.

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

  @property()
  accessor greeting = 'Welcome';

}
```

#### Compiler output considerations

Compiler output for standard decorators is unfortunately large due to the need to generate the accessors, private storage and other objects that are part of the decorators API.

So we recommend that users who wish to use decorators, if possible, use TypeScript experimental decorators for now.

In the future the Lit team plans on adding decorator transforms to our optional Lit Compiler in order to compile standard decorators to a more compact compiler output. Native browser support will also eliminate the need for any compiler transforms at all.
