---
title: Reactive properties
eleventyNavigation:
  key: Reactive properties
  parent: Components
  order: 3
---

*Reactive properties* define the state of the component. Changing one or more of the components' reactive properties triggers a reactive update cycle, re-rendering the component.

Lit manages your reactive properties and their corresponding attributes. In particular:

*   **Reactive updates**. When a reactive property changes, the component schedules an update.
*   **Attribute handling**. By default, Lit sets up an observed attribute corresponding to the property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ back to the attribute.
*   **Superclass properties**. Lit automatically applies property options declared by a superclass. You don't need to redeclare properties unless you want to change options.
*   **Element upgrade**. If a Lit component is defined after the element is already in the DOM, Lit handles upgrade logic, ensuring that any properties set on an element before it was upgraded trigger the correct reactive side effects when the element upgrades.

## Internal reactive state

*Internal reactive state* refers to reactive properties that are  not part of the component's public API. These state properties don't have corresponding attributes, and aren't intended to be used from outside the component. Internal reactive state should be set by the component.

Public properties are part of the component's public API, and should be set from the outside.

In general, the component shouldn't set its own public properties, except in response to user input. For example, a menu component might have a public `selected` property that's set when the user selects an item.

In some cases, internal reactive state may be initialized from public properties—for example, if there is a complex transformation between the user-visible data and the internal data.

## Declare reactive properties {#declare}

Declare your element's properties using decorators or the static `properties` field:

_Decorator (requires TypeScript or Babel)_

<div class="language-ts">
<pre class="highlight">
export class MyElement extends LitElement {
  // Reactive property
  @property(<var>options</var>)
  <var>propertyName</var>;
  // Internal reactive state
  @state(<var>options</var>)
  <var>PropertyName</var>
</pre>
</div>


_Properties field_

<div class="language-js">
<pre class="highlight">
static get properties() {
  return {
    // Reactive property
    <var>propertyName</var>: <var>options</var>,
    // Internal reactive state
    <var>propertyName</var>: {state: true, ...<var>options</var>}
  };
}
</pre>
</div>

In either case, you can pass an options object to configure features for the property.

Properties declared in a static properties field should be initialized in the constructor. Properties declared with the `@property` and `@state` decorators can either be initialized using  class field initializers or in the constructor.

### Property options

The options object can have the following properties:

<dl>
<dt>

`attribute`

</dt>
<dd>

Whether the property is associated with an attribute, or a custom name for the associated attribute. Default: true. See [Configure observed attributes](#observed-attributes). If `attribute` is false, the `converter`, `reflect` and `type` options are ignored.

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

A function that takes an `oldValue` and `newValue` and returns a boolean to indicate whether a [property has changed](#haschanged) when being set. If unspecified, LitElement uses a strict inequality check (`newValue !== oldValue`) to determine whether the property value has changed.

</dd>
<dt>

`noAccessor`

</dt>
<dd>

Set to true to avoid generating the default [property accessor](#accessors). Default: false.

</dd>
<dt>

`reflect`

</dt>
<dd>

Whether property value is reflected back to the associated attribute. Default: false. See  [Configure reflected attributes](#reflected-attributes).

</dd>
<dt>

`state`

</dt>
<dd>

Set to true to declare the property as _internal reactive state_. Internal reactive state triggers updates like public reactive properties, but Lit doesn't generate an attribute for it, and users shouldn't access it from outside the component. Equivalent to using the `@state` decorator.

</dd>
<dt>

`type`

</dt>
<dd>

A type hint for converting between properties and attributes. This hint is used by LitElement's default attribute converter, and is ignored if `converter` is set. If `type` is unspecified, behaves like `type: String`. See [Use LitElement's default attribute converter](#conversion-type).

</dd>

An empty options object is equivalent to specifying the default value for all options.

<div class="alert alert-info">

**An options object by another name.** This guide uses the descriptive term "options object." In practice the options object is an instance of `PropertyDeclaration`, so you'll see that name if you're using an IDE, or looking at the API reference. By either name, it's an object that defines a set of options.

</div>

### Declare properties with decorators {#declare-with-decorators}

Use the `@property` decorator with a class field declaration to declare a reactive property.

```ts
@property()
mode;

@property({attribute: false})
data = {};
```


The argument to the `@property`  decorators is an [options object](#property-options). Omitting the argument is equivalent to specifying the default value for all options.

<div class="alert alert-info">

**Using decorators.** Decorators are a proposed JavaScript feature, so you'll need to use a transpiler like Babel or the TypeScript compiler to use decorators. See [Using decorators](decorators) for details.

</div>

Use the `@state` decorator to declare internal reactive state:

```ts
@state()
protected _active = false;
```

 Properties declared with `@state` shouldn't be referenced from outside the component. In TypeScript, these properties should be marked as private or protected. We also recommend using a convention like a leading underscore (`_`) to identify private or protected properties for JavaScript users.

The `@state` decorator automatically sets `attribute` to false; **the only option you can specify for internal reactive state is the `hasChanged` function.**

The `@state` decorator can also serve as a hint to a code minifier that the property name can be changed during minification.

### Declare properties in a static properties field

To declare properties in a static `properties` field:

```js
static get properties() {
  return {
    mode: {},
    data: {attribute: false},
    _active: {state: true}
  };
}
```

An empty option object is equivalent to specifying the default value for all options.

Use the `state: true` option to declare internal reactive state. This automatically sets `attribute` to false; **the only other option you can specify for internal reactive state is the `hasChanged` function.**

<div class="alert alert-info">

**If you're using the static properties field, initialize properties in the constructor**. Class field initializers won't work in this case.

</div>

## What happens when properties change {#when-properties-change}

A property change can trigger an asynchronous update cycle, which causes the component to re-render its template.

When a property changes, the following sequence occurs:

1.  The property's setter is called.
1.  The setter calls the property's `hasChanged` function. The `hasChanged` function takes the property's old and new values, and returns true if the change should trigger an update. (The default `hasChanged` uses a strict inequality test (`oldValue !=== newValue`) to determine if the property has changed.)
1.  If `hasChanged` returns true, the setter calls `requestUpdate` to schedule an update. The update itself happens asynchronously, so if several properties are updated at once, they only trigger a single update.
1.  The component's `update` method is called, reflecting changed properties to attributes and re-rendering the component's templates.

There are many ways to hook into and modify the reactive update cycle. For more information, see [Reactive update cycle](/guide/components/lifecycle/#reactive-update-cycle).

## Initialize property values {#initialize}

Typically, you initialize property values in the element constructor.

When using decorators, you can initialize the property value using a class field initializer (equivalent to setting the value in the constructor).

You may want to defer initializing a property if the value is expensive to compute and is not not required for the initial render of your component. This is a fairly rare case.

### Initialize property values when using decorators

When using the `@property` decorator, you can initialize the property using a class field initializer:

```ts
@property()
greeting: string = 'Hello';
```

### Initialize property values in the element constructor {#initialize-constructor}

If you implement a static properties field, initialize your property values in the element constructor:

```js
static get properties() { return { /* Property declarations */ }; }

constructor() {
  super();

  // Initialize properties
  this.greeting = 'Hello';
}
```

## Configure attributes {#attributes}

By default, Lit sets up an observed attribute corresponding to the property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ back to the attribute.

While element properties can be of any type, attributes are always strings. This impacts the [observed attributes](#observed-attributes) and [reflected attributes](#reflected-attributes) of non-string properties:

  * To **observe** an attribute (set a property from an attribute), the attribute value must be converted from a string to match the property type.

  * To **reflect** an attribute (set an attribute from a property), the property value must be converted to a string.

### Using the default converter {#conversion-type}

LitElement has a default converter which handles `String`, `Number`, `Boolean`, `Array`, and `Object` property types.

To use the default converter, specify the `type` option in your property declaration:

```js
// Use LitElement's default converter
count: { type: Number },
```

The information below shows how the default converter handles conversion for each type.

**Convert from attribute to property**

* For **Strings**, when the attribute is defined, set the property to the attribute value.
* For **Numbers**, when the attribute is defined, set the property to `Number(attributeValue)`.
* For **Booleans**, when the attribute is:
  * non-`null`, set the property to `true`.
  * `null` or `undefined`, set the property to `false`.
* For **Objects and Arrays**, when the attribute is:
  * Defined, set the property value to `JSON.parse(attributeValue)`.

**Convert from property to attribute**

* For **Strings**, when the property is:
  * `null`, remove the attribute.
  * `undefined`, don't change the attribute.
  * Defined and not `null`, set the attribute to the property value.
* For **Numbers**, when the property is:
  * `null`, remove the attribute.
  * `undefined`, don't change the attribute.
  * Defined and not `null`, set the attribute to the property value.
* For **Booleans**, when the property is:
  * truthy, create the attribute.
  * falsy, remove the attribute.
* For **Objects and Arrays**, when the property is:
  * `null` or `undefined`, remove the attribute.
  * Defined and not `null`, set the attribute value to `JSON.stringify(propertyValue)`.

### Configuring a custom converter {#conversion-converter}

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

If no `toAttribute` function is supplied for a reflected attribute, the attribute is set to the property value without conversion.

During an update:

  * If `toAttribute` returns `null`, the attribute is removed.

  * If `toAttribute` returns `undefined`, the attribute is not changed.

### Configure observed attributes {#observed-attributes}

An **observed attribute** fires the custom elements API callback `attributeChangedCallback` whenever it changes. By default, whenever an attribute fires this callback, Lit sets the property value from the attribute using the property's `fromAttribute` function.

By default, Lit creates a corresponding observed attribute for all reactive properties. The name of the observed attribute is the property name, lowercased:

```js
// observed attribute name is "myprop"
myProp: { type: Number }
```

To create an observed attribute with a different name, set `attribute` to a string:

```js
// Observed attribute will be called my-prop
myProp: { attribute: 'my-prop' }
```

To prevent an observed attribute from being created for a property, set `attribute` to `false`. The property will not be initialized from attributes in markup, and attribute changes won't affect it.

```js
// No observed attribute for this property
myProp: { attribute: false }
```

An observed attribute can be used to provide an initial value for a property via markup. See [Initialize properties with attributes in markup](#initialize-markup).


### Configure reflected attributes {#reflected-attributes}

You can configure a property so that whenever it changes, its value is reflected to its [observed attribute](#observed-attributes). Reflected attributes are useful because attributes are visible to CSS, and to DOM APIs like `querySelector`.

For example:

```js
// Value of property "active" will reflect to attribute "active"
active: {reflect: true}
```

When the property changes, Lit uses the `toAttribute` function in the property's converter to set the attribute value from the new property value.

* If `toAttribute` returns `null`, the attribute is removed.

* If `toAttribute` returns `undefined`, the attribute is not changed.

* If `toAttribute` itself is undefined, the attribute value is set to the property value without conversion.

<div class="alert alert-info">

**Lit tracks reflection state during updates.** Lit keeps track of  state information to avoid creating an infinite loop of changes between a property and an observed, reflected attribute.

</div>

{% playground-example "properties/attributereflect" "my-element.ts" %}

### Set property values from attributes in markup {#initialize-markup}

If a property is configured with `attribute: true` (the default), users can set the property values from observed attributes in static markup:

_index.html_

```html
<my-element
  mystring="hello world"
  mynumber="5"
  mybool
  myobj='{"stuff":"hi"}'
  myarray='[1,2,3,4]'></my-element>
```

See [observed attributes](#observed-attributes) and [converting between properties and attributes](#conversion) for more information on setting up initialization from attributes.

<div class="alert alert-info">

**Attributes versus properties.** Setting a static attribute value is not the same as using an expression to set a property. See [Set properties](/guide/templates/expressions/#set-properties).

</div>

## Configure property accessors {#accessors}

By default, LitElement generates a getter/setter pair for all reactive properties. The setter is invoked whenever you set the property:

```ts
// Declare a property
@property()
greeting: string = 'Hello';
...
// Later, set the property
this.greeting = 'Hola'; // invokes greeting's generated property accessor
```

Generated accessors automatically call `requestUpdate()`, initiating an update if one has not already begun.

### Create your own property accessors {#accessors-custom}

To specify how getting and setting works for a property, you can define your own getter/setter pair. For example:

```ts
private _prop = 0;

set prop(val: number) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}

@property()
get prop() { return this._prop; }
```

To use custom property accessors with the `@property` or `@state` decorators, put the decorator on the getter, as shown above.

The setters that Lit generates automatically call `requestUpdate()`. If you write your own setter you must call `requestUpdate()` manually, supplying the property name and its old value.

In most cases, **you do not need to crete custom property accessors.** To compute values from existing properties, we recommend using the [`willUpdate`](/guide/components/lifecycle/#willupdate) callback, which allows you to set values during the update cycle without triggering an additonal update.

If your class defines its own accessors for a property, Lit will not overwrite them with generated accessors. If your class does not define accessors for a property, Lit will generate them, even if a superclass has defined the property or accessors.

### Prevent Lit from generating a property accessor {#accessors-noaccessor}

In rare cases, a subclass may need to change or add property options for a property that exists on its superclass.

To prevent Lit from generating a property accessor that overwrites the superclass's defined accessor, set `noAccessor` to `true` in the property declaration:

```js
static get properties() {
  return { myProp: { type: Number, noAccessor: true } };
}
```

You don't need to set `noAccessor` when defining your own accessors.

## Configure property changes {#haschanged}

All declared properties have a function, `hasChanged()`, which is called when the property is set.

`hasChanged` compares the property's old and new values, and evaluates whether or not the property has changed. If `hasChanged()` returns true, LitElement starts an element update if one is not already scheduled. See the [Component update lifecycle documentation](/guide/components/lifecycle/) for more information on how updates work.

By default:

* `hasChanged()` returns `true` if `newVal !== oldVal`.
* `hasChanged()` returns `false` if both the new and old values are `NaN`.

To customize `hasChanged()` for a property, specify it as a property option:

```js
myProp: { hasChanged(newVal, oldVal) {
  // compare newVal and oldVal
  // return `true` if an update should proceed
}}
```

<div class="alert alert-info">

**hasChanged may not be called for every change.** If a property's `hasChanged` returns true once, it won't be called again until after the next update, even if the property is changed multiple times. If you want to be notified each time a property is set, you should create a custom setter for the property, as described in [Create your own property accessors](#accessors-custom).

</div>

**Example: Configure property changes**

{% playground-example "properties/haschanged" "my-element.ts" %}

