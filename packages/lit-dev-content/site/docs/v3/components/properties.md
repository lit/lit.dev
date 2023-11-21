---
title: Reactive properties
eleventyNavigation:
  key: Reactive properties
  parent: Components
  order: 3
versionLinks:
  v1: components/properties/
  v2: components/properties/
---

Lit components receive input and store their state as JavaScript class fields or properties. *Reactive properties* are properties that can trigger the reactive update cycle when changed, re-rendering the component, and optionally be read or written to attributes.

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  @property()
  name?: string;
}
```

```js
class MyElement extends LitElement {
  static properties = {
    name: {},
  };
}
```

{% endswitchable-sample %}

Lit manages your reactive properties and their corresponding attributes. In particular:

*   **Reactive updates**. Lit generates a getter/setter pair for each reactive property. When a reactive property changes, the component schedules an update.
*   **Attribute handling**. By default, Lit sets up an observed attribute corresponding to the property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ back to the attribute.
*   **Superclass properties**. Lit automatically applies property options declared by a superclass. You don't need to redeclare properties unless you want to change options.
*   **Element upgrade**. If a Lit component is defined after the element is already in the DOM, Lit handles upgrade logic, ensuring that any properties set on an element before it was upgraded trigger the correct reactive side effects when the element upgrades.

## Public properties and internal state

Public properties are part of the component's public API. In general, public properties—especially public reactive properties—should be treated as _input_.

The component shouldn't change its own public properties, except in response to user input. For example, a menu component might have a public `selected` property that can be initialized to a given value by the owner of the element, but that is updated by the component itself when the user selects an item. In these instances, the component should dispatch an event to indicate to the component's owner that the `selected` property changed. See [Dispatching events](/docs/v3/components/events/#dispatching-events) for more details.

Lit also supports _internal reactive state_. Internal reactive state refers to reactive properties that _aren't_ part of the component's API. These properties don't have a corresponding attribute, and are typically marked protected or private in TypeScript.

{% switchable-sample %}

```ts
@state()
private _counter = 0;
```

```js
static properties = {
  _counter: {state: true}
};

constructor() {
  super();
  this._counter = 0;
}
```

{% endswitchable-sample %}

The component manipulates its own internal reactive state.
In some cases, internal reactive state may be initialized from public properties—for example, if there is an expensive transformation between the user-visible property and the internal state.

As with public reactive properties, updating internal reactive state triggers an update cycle. For more information, see [Internal reactive state](#internal-reactive-state).

## Public reactive properties {#declare}

Declare your element's public reactive properties using decorators or the static `properties` field.

In either case, you can pass an options object to configure features for the property.

### Declaring properties with decorators {#declare-with-decorators}

Use the `@property` decorator with a class field declaration to declare a reactive property.

```ts
class MyElement extends LitElement {
  @property({type: String})
  mode?: string;

  @property({attribute: false})
  data = {};
}
```

The argument to the `@property`  decorators is an [options object](#property-options). Omitting the argument is equivalent to specifying the default value for all options.

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you'll need to use a compiler like Babel or the TypeScript compiler to use decorators. See [Enabling decorators](/docs/v3/components/decorators/#enabling-decorators) for details.

</div>

### Declaring properties in a static properties class field

To declare properties in a static `properties` class field:

```js
class MyElement extends LitElement {
  static properties = {
    mode: {type: String},
    data: {attribute: false},
  };

  constructor() {
    super();
    this.data = {};
  }
}
```

An empty option object is equivalent to specifying the default value for all options.

### Avoiding issues with class fields when declaring properties {#avoiding-issues-with-class-fields}

[Class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) have a problematic interaction with reactive properties. Class fields are defined on the element instance whereas reactive properties are defined as accessors on the element prototype. According to the rules of JavaScript, an instance property takes precedence over and effectively hides a prototype property. This means that reactive property accessors do not function when class fields are used such that setting the property won't trigger an element update.

```js
class MyElement extends LitElement {
  static properties = {foo: {type: String}}
  foo = 'Default'; // ❌ this will make `foo` not reactive
}
```

In **JavaScript**, you **must not use class fields** when declaring reactive properties. Instead, properties must be initialized in the element constructor:
```js
class MyElement extends LitElement {
  static properties = {foo: {type: String}}
  constructor() {
    super();
    this.foo = 'Default';
  }
}
```

Alternatively, you may use [standard decorators with Babel](/docs/v3/components/decorators/#decorators-babel) to declare reactive properties.
```ts
class MyElement extends LitElement {
  @property()
  accessor foo = 'Default';
}
```

For **TypeScript**, you **may use class fields** for declaring reactive properties as long as you use one of these patterns:
* Set the `useDefineForClassFields` compiler option to `false`. This is already the recommendation when [using decorators with TypeScript](/docs/v3/components/decorators/#decorators-typescript).
```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true, // If using decorators
    "useDefineForClassFields": false,
  }
}
```
```ts
class MyElement extends LitElement {
  static properties = {foo: {type: String}}
  foo = 'Default';

  @property()
  bar = 'Default';
}
```

* Add the `declare` keyword on the field, and put the field's initializer in the constructor.
```ts
class MyElement extends LitElement {
  declare foo: string;
  static properties = {foo: {type: String}}
  constructor() {
    super();
    this.foo = 'Default';
  }
}
```

* Add the `accessor` keyword on the field to use [auto-accessors](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#auto-accessors-in-classes).
```ts
class MyElement extends LitElement {
  static properties = {foo: {type: String}}
  accessor foo = 'Default';

  @property()
  accessor bar = 'Default';
}
```

### Property options

The options object can have the following properties:

<dl>
<dt>

`attribute`

</dt>
<dd>

Whether the property is associated with an attribute, or a custom name for the associated attribute. Default: true. If `attribute` is false, the `converter`, `reflect` and `type` options are ignored. For more information, see [Setting the attribute name](#observed-attributes).

</dd>
<dt>

`converter`

</dt>
<dd>

A [custom converter](#conversion-converter) for converting between properties and attributes. If unspecified, use the [default attribute converter](#conversion-type).

</dd>
<dt>

`hasChanged`

</dt>
<dd>

A function called whenever the property is set to determine if the property has changed, and should trigger an update. If unspecified, LitElement uses a strict inequality check (`newValue !== oldValue`) to determine whether the property value has changed.
For more information, see [Customizing change detection](#haschanged).

</dd>
<dt>

`noAccessor`

</dt>
<dd>

Set to true to avoid generating the default property accessors. This option is rarely necessary. Default: false. For more information, see [Preventing Lit from generating a property accessor](#accessors-noaccessor).

</dd>
<dt>

`reflect`

</dt>
<dd>

Whether property value is reflected back to the associated attribute. Default: false. For more information, see [Enabling attribute reflection](#reflected-attributes).

</dd>
<dt>

`state`

</dt>
<dd>

Set to true to declare the property as _internal reactive state_. Internal reactive state triggers updates like public reactive properties, but Lit doesn't generate an attribute for it, and users shouldn't access it from outside the component. Equivalent to using the `@state` decorator. Default: false. For more information, see [Internal reactive state](#internal-reactive-state).

</dd>
<dt>

`type`

</dt>
<dd>

When converting a string-valued attribute into a property, Lit's default attribute converter will parse the string into the type given, and vice-versa when reflecting a property to an attribute. If `converter` is set, this field is passed to the converter. If `type` is unspecified, the default converter treats it as `type: String`. See [Using the default converter](#conversion-type).

When using TypeScript, this field should generally match the TypeScript type declared for the field. However, the `type` option is used by the Lit's _runtime_ for string serialization/deserialization, and should not be confused with a _type-checking_ mechanism.

</dd>

Omitting the options object or specifying an empty options object is equivalent to specifying the default value for all options.

## Internal reactive state

*Internal reactive state* refers to reactive properties that are  not part of the component's public API. These state properties don't have corresponding attributes, and aren't intended to be used from outside the component. Internal reactive state should be set by the component itself.

Use the `@state` decorator to declare internal reactive state:

```ts
@state()
protected _active = false;
```

Using the static `properties` class field, you can declare internal reactive state by using the `state: true` option.

```js
static properties = {
  _active: {state: true}
};

constructor() {
  this._active = false;
}
```

Internal reactive state shouldn't be referenced from outside the component. In TypeScript, these properties should be marked as private or protected. We also recommend using a convention like a leading underscore (`_`) to identify private or protected properties for JavaScript users.

Internal reactive state works just like public reactive properties, except that there is no attribute associated with the property. **The only option you can specify for internal reactive state is the `hasChanged` function.**

The `@state` decorator can also serve as a hint to a code minifier that the property name can be changed during minification.

## What happens when properties change {#when-properties-change}

A property change can trigger a reactive update cycle, which causes the component to re-render its template.

When a property changes, the following sequence occurs:

1.  The property's setter is called.
1.  The setter calls the component's `requestUpdate` method.
1.  The property's old and new values are compared.
    -  By default Lit uses a strict inequality test to determine if the value has changed (that is `newValue !== oldValue`).
    -  If the property has a `hasChanged` function, it's called with the property's old and new values.
1.  If the property change is detected, an update is scheduled asynchronously. If an update is already scheduled, only a single update is executed.
1.  The component's `update` method is called, reflecting changed properties to attributes and re-rendering the component's templates.

Note that if you mutate an object or array property, it won't trigger an update, because the object itself hasn't changed. For more information, see [Mutating object and array properties](#mutating-properties).

There are many ways to hook into and modify the reactive update cycle. For more information, see [Reactive update cycle](/docs/v3/components/lifecycle/#reactive-update-cycle).

For more information about property change detection, see [Customizing change detection](#haschanged).

### Mutating object and array properties {#mutating-properties}

Mutating an object or array doesn't change the object reference, so it won't trigger an update. You can handle object and array properties in one of two ways:

-   **Immutable data pattern.** Treat objects and arrays as immutable. For example, to remove an item from `myArray`, construct a new array:

    ```js
    this.myArray = this.myArray.filter((_, i) => i !== indexToRemove);
    ```

    While this example is simple, it's often helpful to use a library like [Immer](https://immerjs.github.io/immer/) to manage immutable data. This can help avoid tricky boilerplate code when setting deeply nested objects.

-   **Manually triggering an update.** Mutate the data and call `requestUpdate()` to trigger an update directly. For example:

    ```js
    this.myArray.splice(indexToRemove, 1);
    this.requestUpdate();
    ```

    When called with no arguments, `requestUpdate()` schedules an update, without calling a `hasChanged()` function. But note that `requestUpdate()` only causes the _current_ component to update. That is, if a component uses the code shown above, **and** the component passes `this.myArray` to a subcomponent, the subcomponent will detect that the array reference hasn't changed, so it won't update.

**In general, using top-down data flow with immutable objects is best for most applications.** It ensures that every component that needs to render a new value does (and does so as efficiently as possible, since parts of the data tree that didn't change won't cause components that rely on them to update).

Mutating data directly and calling `requestUpdate()` should be considered an advanced use case. In this case, you (or some other system) need to identify all the components that use the mutated data and call `requestUpdate()` on each one. When those components are spread across an application, this gets hard to manage. Not doing so robustly means that you might modify an object that's rendered in two parts of your application, but only have one part update.

In simple cases, when you know that a given piece of data is only used in a single component, it should be safe to mutate the data and call `requestUpdate()`, if you prefer.

## Attributes {#attributes}

While properties are great for receiving JavaScript data as input, attributes are the standard way HTML allows configuring elements from _markup_, without needing to use JavaScript to set properties. Providing both a property _and_ attribute interface for their reactive properties is a key way Lit components can be useful in a wide variety of environments, including those rendered without a client-side templating engine, such as static HTML pages served from CMSs.

By default, Lit sets up an observed attribute corresponding to each public reactive property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ (written back to the attribute).

While element properties can be of any type, attributes are always strings. This impacts the [observed attributes](#observed-attributes) and [reflected attributes](#reflected-attributes) of non-string properties:

  * To **observe** an attribute (set a property from an attribute), the attribute value must be converted from a string to match the property type.

  * To **reflect** an attribute (set an attribute from a property), the property value must be converted to a string.

Boolean properties that expose an attribute should default to false. For more information, see [Boolean attributes](#boolean-attributes).

### Setting the attribute name {#observed-attributes}

By default, Lit creates a corresponding observed attribute for all public reactive properties. The name of the observed attribute is the property name, lowercased:

{% switchable-sample %}

```ts
// observed attribute name is "myvalue"
@property({ type: Number })
myValue = 0;
```

```js
// observed attribute name is "myvalue"
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

{% endswitchable-sample %}

To create an observed attribute with a different name, set `attribute` to a string:

{% switchable-sample %}

```ts
// Observed attribute will be called my-name
@property({ attribute: 'my-name' })
myName = 'Ogden';
```

```js
// Observed attribute will be called my-name
static properties = {
  myName: { attribute: 'my-name' },
};

constructor() {
  super();
  this.myName = 'Ogden'
}
```

{% endswitchable-sample %}

To prevent an observed attribute from being created for a property, set `attribute` to `false`. The property will not be initialized from attributes in markup, and attribute changes won't affect it.

{% switchable-sample %}

```ts
// No observed attribute for this property
@property({ attribute: false })
myData = {};
```

```js
// No observed attribute for this property
static properties = {
  myData: { attribute: false },
};

constructor() {
  super();
  this.myData = {};
}
```

{% endswitchable-sample %}

Internal reactive state never has an associated attribute.

An observed attribute can be used to provide an initial value for a property from markup. For example:

```html
<my-element myvalue="99"></my-element>
```

### Using the default converter {#conversion-type}

Lit has a default converter that handles `String`, `Number`, `Boolean`, `Array`, and `Object` property types.

To use the default converter, specify the `type` option in your property declaration:

{% switchable-sample %}

```ts
// Use the default converter
@property({ type: Number })
count = 0;
```

```js
// Use the default converter
static properties = {
  count: { type: Number },
};

constructor() {
  super();
  this.count = 0;
}
```

{% endswitchable-sample %}

If you don't specify a type _or_ a custom converter for a property, it behaves as if you'd specified `type: String`.

The tables below shows how the default converter handles conversion for each type.

**From attribute to property**

| Type    | Conversion |
|:--------|:-----------|
| `String`  | If the element has the corresponding attribute, set the property to the attribute value. |
| `Number`  | If the element has the corresponding attribute, set the property to `Number(attributeValue)`. |
| `Boolean` | If the element has the corresponding attribute, set the property to true.<br>If not, set the property to false. |
| `Object`, `Array` | If the element has the corresponding attribute, set the property value to `JSON.parse(attributeValue)`. |

For any case except `Boolean`, if the element doesn't have the corresponding attribute, the property keeps its default value, or `undefined` if no default is set.

**From property to attribute**

| Type    | Conversion |
|:--------|:-----------|
| `String`, `Number` | If property is defined and non-null, set the attribute to the property value.<br>If property is null or undefined, remove the attribute. |
| `Boolean` | If property is truthy, create the attribute and set its value to an empty string. <br>If property is falsy, remove the attribute |
| `Object`, `Array` | If property is defined and non-null, set the attribute to `JSON.stringify(propertyValue)`.<br>If property is null or undefined, remove the attribute. |


### Providing a custom converter {#conversion-converter}

You can specify a custom property converter in your property declaration with the `converter` option:

```js
myProp: {
  converter: // Custom property converter
}
```

`converter` can be an object or a function. If it is an object, it can have keys for `fromAttribute` and `toAttribute`:

```js
prop1: {
  converter: {
    fromAttribute: (value, type) => {
      // `value` is a string
      // Convert it to a value of type `type` and return it
    },
    toAttribute: (value, type) => {
      // `value` is of type `type`
      // Convert it to a string and return it
    }
  }
}
```

If `converter` is a function, it is used in place of `fromAttribute`:

```js
myProp: {
  converter: (value, type) => {
    // `value` is a string
    // Convert it to a value of type `type` and return it
  }
}
```

If no `toAttribute` function is supplied for a reflected attribute, the attribute is set to the property value using the default converter.

If `toAttribute` returns `null` or `undefined`, the attribute is removed.

### Boolean attributes {#boolean-attributes}

For a boolean property to be configurable from an attribute, **it must default to false**. If it defaults to true, you cannot set it to false from markup, since the presence of the attribute, with or without a value, equates to true. This is the standard behavior for attributes in the web platform.

If this behavior doesn't fit your use case, there are a couple of options:

- Change the property name so it defaults to false. For example, the web platform uses the `disabled` attribute (defaults to false), not `enabled`.

- Use a string-valued or number-valued attribute instead.

### Enabling attribute reflection {#reflected-attributes}

You can configure a property so that whenever it changes, its value is reflected to its [corresponding attribute](#observed-attributes). Reflected attributes are useful because attributes are visible to CSS, and to DOM APIs like `querySelector`.

For example:

```js
// Value of property "active" will reflect to attribute "active"
active: {reflect: true}
```

When the property changes, Lit sets the corresponding attribute value as described in [Using the default converter](#conversion-type) or [Providing a custom converter](#conversion-converter).

{% playground-example "properties/attributereflect" "my-element.ts" %}

Attributes should generally be considered input to the element from its owner, rather than under control of the element itself, so reflecting properties to attributes should be done sparingly. It's necessary today for cases like styling and accessibility, but this is likely to change as the platform adds features like the [`:state` pseudo selector](https://wicg.github.io/custom-state-pseudo-class/) and the [Accessibility Object Model](https://wicg.github.io/aom/spec/), which fill these gaps.

Reflecting properties of type object or array is not recommended. This can cause large objects to serialize to the DOM which can result in poor performance.

<div class="alert alert-info">

**Lit tracks reflection state during updates.** You may have realized that if property changes are reflected to an attribute and attribute changes update the property, it has the potential to create an infinite loop. However, Lit tracks when properties and attributes are set specifically to prevent this from happening

</div>

## Custom property accessors {#accessors}

By default, LitElement generates a getter/setter pair for all reactive properties. The setter is invoked whenever you set the property:

{% switchable-sample %}

```ts
// Declare a property
@property()
greeting: string = 'Hello';
...
// Later, set the property
this.greeting = 'Hola'; // invokes greeting's generated property accessor
```

```js
// Declare a property
static properties = {
  greeting: {},
}
constructor() {
  this.super();
  this.greeting = 'Hello';
}
...
// Later, set the property
this.greeting = 'Hola'; // invokes greeting's generated property accessor
```

{% endswitchable-sample %}

Generated accessors automatically call `requestUpdate()`, initiating an update if one has not already begun.

### Creating custom property accessors {#accessors-custom}

To specify how getting and setting works for a property, you can define your own getter/setter pair. For example:

{% switchable-sample %}

```ts
private _prop = 0;

@property()
set prop(val: number) {
  this._prop = Math.floor(val);
}

get prop() { return this._prop; }
```

```js
static properties = {
  prop: {},
};

_prop = 0;

set prop(val) {
  this._prop = Math.floor(val);
}

get prop() { return this._prop; }
```

{% endswitchable-sample %}

To use custom property accessors with the `@property` or `@state` decorators, put the decorator on the setter, as shown above. `@property` or `@state` decorated setters call `requestUpdate()`.

In most cases, **you do not need to create custom property accessors.** To compute values from existing properties, we recommend using the [`willUpdate`](/docs/v3/components/lifecycle/#willupdate) callback, which allows you to set values during the update cycle without triggering an additional update. To perform a custom action after the element updates, we recommend using the [`updated`](/docs/v3/components/lifecycle/#updated) callback. A custom setter can be used in rare cases when it's important to synchronously validate any value the user sets.

If your class defines its own accessors for a property, Lit will not overwrite them with generated accessors. If your class does not define accessors for a property, Lit will generate them, even if a superclass has defined the property or accessors.

### Prevent Lit from generating a property accessor {#accessors-noaccessor}

In rare cases, a subclass may need to change or add property options for a property that exists on its superclass.

To prevent Lit from generating a property accessor that overwrites the superclass's defined accessor, set `noAccessor` to `true` in the property declaration:

```js
static properties = {
  myProp: { type: Number, noAccessor: true }
};
```

You don't need to set `noAccessor` when defining your own accessors.

## Customizing change detection {#haschanged}

All reactive properties have a function, `hasChanged()`, which is called when the property is set.

`hasChanged` compares the property's old and new values, and evaluates whether or not the property has changed. If `hasChanged()` returns true, Lit starts an element update if one is not already scheduled. For more information on updates, see [Reactive update cycle](/docs/v3/components/lifecycle/#reactive-update-cycle) .

The default implementation of `hasChanged()` uses a strict inequality comparison: `hasChanged()` returns `true` if `newVal !== oldVal`.

To customize `hasChanged()` for a property, specify it as a property option:

{% switchable-sample %}

```ts
@property({
  hasChanged(newVal: string, oldVal: string) {
    return newVal?.toLowerCase() !== oldVal?.toLowerCase();
  }
})
myProp: string | undefined;
```

```js
static properties = {
  myProp: {
    hasChanged(newVal, oldVal) {
      return newVal?.toLowerCase() !== oldVal?.toLowerCase();
    }
  }
};
```

{% endswitchable-sample %}

In the following example, `hasChanged()` only returns true for odd values.

{% playground-example "properties/haschanged" "my-element.ts" %}
