---
title: 响应式组件
eleventyNavigation:
  key: 响应式组件
  parent: 组件
  order: 3
versionLinks:
  v1: components/properties/
---

Lit组件接收输入，然后将其保存为JavaScript类的字段或属性。 *响应式属性*是一种特殊的属性(properties)，当它们被更改时会触发响应式更新周期、重新渲染组件以及读取或写入属性(attributes)。

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  @property()
  name: string;
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

Lit会自动管理你的响应式属性(properties)及其相应的属性(attributes)：

* **响应更新**。 Lit为每个响应式属性生成一个getter/setter对。当响应式属性发生变化时，组件就会安排更新。
* **属性(Attribute)处理**。 默认情况下，Lit会设置一个与属性(property)相对应的被观察属性(attribute)，当被观察属性(attribute)发生变化时更新属性(property)。 属性(property)值也可以选择性地被“反射”回属性(attribute)。
* **父类属性**。 Lit自动继承父类声明的属性。如果你不想更改选项，那么你不需要重新声明属性。
* **元素升级**。 如果一个Lit组件的元素已经存在于DOM树中，然后再去定义组件，那么就会触发Lit的升级逻辑，确保在升级之前设置在元素上的任何属性(property)在元素在升级时触发正确的响应式副作用。

## 公共属性(property)和内部状态

公共属性是组件公共API的一部分。一般来说，公共属性尤其是公共响应式属性，应该被视为“输入”。

组件不应更改自己的公共属性，而是响应用户的输入去更改。例如，一个菜单组件可能有一个公共属性`selected`，该属性可以由元素的创建的时候初始化为一个给定的值，但是当用户选择一个项目时，组件就可以响应用户的输入更改它。与此同时，组件应该触发一个事件来向组件的所有者表明`selected`属性已经被更改。查看[调度事件]({{baseurl}}/docs/components/events/#dispatching-events)了解更多信息。

Lit也支持“内部响应式状态”。内部响应式状态指的是那些不是组件API的响应式属性（property）。这些响应式属性（property）不存在与之对应的属性（attribute），通常情况下，这些属性在Typescript中被标记为protected或者private。

{% switchable-sample %}

```ts
@state()
private _counter = 0;
```

```js
static properties = {
  _counter: {state: true};
};

constructor()
  super();
  this._counter = 0;
}
```

{% endswitchable-sample %}

组件可以操作它自己的内部响应式状态。
在某些情况下，例如：如果用户可见的属性很难转换为内部状态，那么内部响应式状态可以直接从公共属性初始化。

与公共响应式属性一样，更新内部反应状态会触发更新周期。查看[内部响应式状态](#internal-reactive-state)了解相关详细信息，。

## 公共响应式属性{#declare}

可以使用装饰器或者静态`properties`字段定义组件的公共响应式属性。

不管使用哪种方式，你都可以传入一个对象来配置属性的一些特性。

### 使用装饰器定义属性 {#declare-with-decorators}

在一个类中使用`@property`装饰器来声明一个响应式属性。

```ts
class MyElement extends LitElement {
  @property({type: String})
  mode: string;

  @property({attribute: false})
  data = {};
}
```

`@property`装饰器的参数是一个[选项对象](#property-options)。如果省略选项对象参数的话，Lit会为所有选项指定默认值。

<div class="alert alert-info">

**使用装饰器** 装饰器是一个还处于在提案阶段的Javasript特性，因此，如果你需要一个像Babel或者Typescript那样的编译器才能使用它。查看[开启装饰器]({{baseurl}}/docs/components/decorators/#enabling-decorators)了解详情.

</div>

### 在静态属性类字段中声明属性

在静态属性类字段`properties`中声明属性:

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

选项对象是空的话，相当于给所有选项设置了默认值。

### 在定义属性时需要避免一些类字段（Fileds）的问题{#avoiding-issues-with-class-fields}

[Class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields) have a problematic interaction with reactive properties. Class fields are defined on the element instance. Reactive properties are defined as accessors on the element prototype. According to the rules of JavaScript, an instance property takes precedence over and effectively hides a prototype property. This means that reactive property accessors do not function when class fields are used. When a property is set, the element does not update.

[类字段](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Public_class_fields)与反应属性的交互存在问题。类字段在元素实例上定义。反应性属性被定义为元素原型上的访问器。根据 JavaScript 的规则，实例属性优先于并有效地隐藏了原型属性。这意味着当使用类字段时，反应式属性访问器不起作用。设置属性后，元素不会更新。

In **JavaScript** you **must not use class fields** when declaring reactive properties. Instead, properties must be initialized in the element constructor:

```js
constructor() {
  super();
  this.data = {};
}
```

For **TypeScript**, you **may use class fields** for declaring reactive properties as long as the `useDefineForClassFields` setting in your `tsconfig` is set to `false`. Note, this is not required for some configurations of TypeScript, but it's recommended to explicitly set it to `false`.

When compiling JavaScript with **Babel**, you **may use class fields** for declaring reactive properties as long as you set `setPublicClassFields` to `true` in the `assumptions` config of your `babelrc`. Note, for older versions of Babel, you also need to include the plugin `@babel/plugin-proposal-class-properties`:

```js
assumptions = {
  "setPublicClassFields": true
};

plugins = [
  ["@babel/plugin-proposal-class-properties"],
];
```

For information about using class fields with **decorators**, see [Avoiding issues with class fields and decorators](/docs/components/decorators/#avoiding-issues-with-class-fields).

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
1.  The property's old and new values are compared. If the property has a `hasChanged` function, it's called with the property's old and new values.
1.  If the property change is detected, an update is scheduled asynchronously. If an update is already scheduled, only a single update is executed.
1.  The component's `update` method is called, reflecting changed properties to attributes and re-rendering the component's templates.

There are many ways to hook into and modify the reactive update cycle. For more information, see [Reactive update cycle](/docs/components/lifecycle/#reactive-update-cycle).

For more information about property change detection, see [Customizing change detection](#haschanged).

## Attributes {#attributes}

While properties are great for receiving JavaScript data as input, attributes are the standard way HTML allows configuring elements from _markup_, without needing to use JavaScript to set properties. Providing both a property _and_ attribute interface for their reactive properties is a key way Lit components can be useful in a wide variety of environments, including those rendered without a client-side templating engine, such as static HTML pages served from CMSs.

By default, Lit sets up an observed attribute corresponding to each public reactive property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ (written back to the attribute).

While element properties can be of any type, attributes are always strings. This impacts the [observed attributes](#observed-attributes) and [reflected attributes](#reflected-attributes) of non-string properties:

  * To **observe** an attribute (set a property from an attribute), the attribute value must be converted from a string to match the property type.

  * To **reflect** an attribute (set an attribute from a property), the property value must be converted to a string.

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

set prop(val: number) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}

@property()
get prop() { return this._prop; }
```

```js
static properties = {
  prop: {},
};

_prop = 0;

set prop(val) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}

get prop() { return this._prop; }
```

{% endswitchable-sample %}

To use custom property accessors with the `@property` or `@state` decorators, put the decorator on the getter, as shown above.

The setters that Lit generates automatically call `requestUpdate()`. If you write your own setter you must call `requestUpdate()` manually, supplying the property name and its old value.

In most cases, **you do not need to create custom property accessors.** To compute values from existing properties, we recommend using the [`willUpdate`](/docs/components/lifecycle/#willupdate) callback, which allows you to set values during the update cycle without triggering an additional update. To perform a custom action after the element updates, we recommend using the [`updated`](/docs/components/lifecycle/#updated) callback. A custom setter can be used in rare cases when it's important to synchronously validate any value the user sets.

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

`hasChanged` compares the property's old and new values, and evaluates whether or not the property has changed. If `hasChanged()` returns true, Lit starts an element update if one is not already scheduled. For more information on updates, see [Reactive update cycle](/docs/components/lifecycle/#reactive-update-cycle) .

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
