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

Lit provides a set of optional decorators that enable declarative APIs for things like registering elements, defining reactive properties and query properties, or adding event options to event handler methods.

For example, the `@customElement` and `@property()` decorators let you register a custom element and define a reactive property in a compact, declarative way:

```ts
@customElement('my-element')
export class MyElement extends LitElement {

  @property()
  greeting = 'Welcome';

}
```

{% aside "info" "no-header"%}

Lit supports two different versions of the JavaScript decorators proposal – an early version supported by TypeScript that we refer to as _experimental decorators_ and a new and final version we refer to as _standard decorators_.
 
There are some small differences in usage between the two proposals (standard decorators often require the `accessor` keyword). Our code samples are written for experimental decorators because we recommend them for production at the moment.
 
See [Decorator versions](#decorator-versions) for more details.

{% endaside %}

## Built-in decorators

| Decorator | Summary | More Info |
|-----------|---------|--------------|
| {% api-v3 "@customElement" "customElement" %} | Defines a custom element. | [Defining](/docs/v3/components/defining/) |
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

In the future when decorators are supported natively in browsers, this will no longer be necessary

### Using decorators with TypeScript { #decorators-typescript }

TypeScript supports both experimental decorators and standard decorators. We recommend that TypeScript developers use experimental decorators for now for [optimal compiler output](#compiler-output-considerations). If your project requires using standard decorators or setting `"useDefineForClassFields": true`, skip down to [migrating to standard decorators](#migrating-typescript-standard-decorators).

To use experimental decorators you must enable the `experimentalDecorators` compiler option.

You should also ensure that the `useDefineForClassFields` setting is `false`. This is only required when `target` is set to `ES2022` or greater, but it is recommended to explicitly set this to `false`. This is needed to [avoid issues with class fields when declaring properties](/docs/v3/components/properties/#avoiding-issues-with-class-fields).

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
  }
}
```

Enabling `emitDecoratorMetadata` is not required and not recommended.

#### Migrating TypeScript experimental decorators to standard decorators { #migrating-typescript-standard-decorators }

Lit decorators are designed to support [standard decorator syntax](#standard-decorators) (using `accessor` on class field decorators) with TypeScript's experimental decorator mode.

This allows incremental migration off of experimental decorators starting with the addition of the `accessor` keyword to decorated properties without a change of behavior. Once all decorated class field use the `accessor` keyword, you can change your compiler options to complete the migration to standard decorators:

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false, // default for TypeScript 5.0 and up
    "useDefineForClassFields": true, // default when "target" is "ES2022" or higher
  }
}
```

Note: The `accessor` keyword was introduced in TypeScript 4.9 and standard decorators with metadata require TypeScript ≥5.2.

### Using decorators with Babel { #decorators-babel }

[Babel](https://babeljs.io/docs/en/) supports standard decorators with the [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) plugin as of version 7.23. Babel does not support TypeScript experimental decorators, so you must use Lit decorators with [standard decorator syntax](#standard-decorators) using the `accessor` keyword on decorated class fields.

Enable decorators by adding [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) with these Babel configuration settings:

```json
// babel.config.json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", {"version": "2023-05"}]
  ]
}
```

Note: Lit decorators only work with `"version": "2023-05"`. Other versions, including the formerly supported `"2018-09"`, are not supported.

## Decorator versions

Decorators are a [stage 3 proposal](https://github.com/tc39/proposal-decorators) for addition to the ECMAScript standard. Compilers like [Babel](https://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) support decorators, though no browsers have implemented them yet. Lit decorators work with Babel and TypeScript, and will work in browsers when they implement them natively.

{% aside "info" %}

What does stage 3 mean?

It means that the specification text is complete, and ready for browsers to implement. Once the specification has been implemented in multiple browsers, it can move to the final stage, stage 4, and be added to the ECMAScript standard. A stage 3 proposal will only change if critical issues are discovered during implementation.

{% endaside %}

### Earlier decorator proposals

Before the TC39 proposal reached stage 3, compilers implemented earlier versions of the decorator specification.

Most notable of these is [TypeScript's _experimental decorators_](https://www.typescriptlang.org/docs/handbook/decorators.html) which Lit has supported since its inception and is our current recommendation for use.

Babel has also supported different versions of the specification over time as can be seen from the [`"version"` option of the decorator plugin](https://babeljs.io/docs/babel-plugin-proposal-decorators#version). In the past, Lit 2 has supported the `"2018-09"` version for Babel users but that has now been dropped in favor of the _standard_ `"2023-05"` version described below.

### Standard decorators { #standard-decorators }

_Standard decorators_ is the version of decorators that has reached Stage 3 consensus at TC39, the body that defines ECMAScript/JavaScript.

Standard decorators are supported in TypeScript and Babel, with native browser coming in the near future.

The biggest difference between standard decorators and experimental decorators is that, for performance reasons, standard decorators cannot change the _kind_ of a class member – fields, accessors, and methods – being decorated and replaced, and will only produce the same kind of member.

Since many Lit decorators generate accessors, this means that the decorators need to be applied to accessors, not class fields.

To make this convenient, the standard decorator specification adds the `accessor` keyword to declare "auto-accessors":

```ts
class MyClass {
  accessor foo = 42;
}
```

Auto-accessors create a getter and setter pair that read and write from a private field. Decorators can then wrap these getters and setters.

Lit decorators that work on class fields with experimental decorators – such as `@property()`, `@state()`, `@query()`, etc. – must be applied to accessors or auto-accessors with standard decorators:

```ts
@customElement('my-element')
export class MyElement extends LitElement {

  @property()
  accessor greeting = 'Welcome';

}
```

### Compiler output considerations

Compiler output for standard decorators is unfortunately large due to the need to generate the accessors, private storage, and other objects that are part of the decorators API.

So we recommend that users who wish to use decorators, if possible, use TypeScript experimental decorators for now.

In the future the Lit team plans on adding decorator transforms to our optional Lit Compiler in order to compile standard decorators to a more compact compiler output. Native browser support will also eliminate the need for any compiler transforms at all.
