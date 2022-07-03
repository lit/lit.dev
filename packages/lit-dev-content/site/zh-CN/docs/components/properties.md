---
title: 响应式属性
eleventyNavigation:
  key: 响应式属性
  parent: 组件
  order: 3
versionLinks:
  v1: components/properties/
---

Lit 组件接收输入，然后将其保存为 JavaScript 类的字段或属性。 *响应式属性*是一种特殊的属性（property），当它们被更改时会触发响应式更新周期、重新渲染组件以及读取或写入属性（attribute）。

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

Lit 会自动管理你的响应式属性（property）及其相应的属性（attribute）：

* **响应更新**。 Lit 为每个响应式属性生成一个getter/setter对。当响应式属性发生变化时，组件就会安排更新。
* **属性（attribute）处理**。 默认情况下，Lit 会设置一个与属性（property）相对应的被观察属性（attribute），当被观察属性（attribute）发生变化时会自动更新属性（property）。 属性（property）值也可以选择性地被“反射”回属性（attribute）。
* **父类属性**。 Lit 自动继承父类声明的属性。如果你不想更改选项，就不需要重新声明属性。
* **元素升级**。 如果一个 Lit 组件的元素已经存在于 DOM 树中，然后再次去定义组件，那么就会触发 Lit 的升级逻辑，确保在升级之前设置在元素上的任何属性（property）在元素在升级时触发正确的响应式副作用。

## 公共属性（property）和内部状态

公共属性是组件公共 API 的一部分。一般来说，公共属性尤其是公共响应式属性，应该被视为*输入*。

组件不应更改自己的公共属性，而是响应用户的输入去更改。例如，一个菜单组件可能有一个公共属性`selected`，该属性可以在元素被创建的时候初始化为一个给定的值，但是当用户选择一个项目时，组件就可以响应用户的输入更改它。与此同时，组件应该触发一个事件来向组件的所有者表明 `selected` 属性已经被更改。请参阅[分发事件]({{baseurl}}/docs/components/events/#dispatching-events)了解更多信息。

Lit也支持*内部响应式状态*。内部响应式状态指的是那些不是组件 API 的响应式属性（property）。这些响应式属性（property）不存在与之对应的属性（attribute），通常情况下，这些属性在 Typescript 中被标记为 protected 或者 private。

{% switchable-sample %}

```ts
@state()
private _counter = 0;
```

```js
static properties = {
  _counter: {state: true};
};

constructor() {
  super();
  this._counter = 0;
}
```

{% endswitchable-sample %}

组件可以操作它自己的内部响应式状态。
在某些情况下，例如：如果用户可见的属性很难转换为内部状态，那么内部响应式状态可以直接从公共属性初始化。

与公共响应式属性一样，更新内部反应状态会触发更新周期。请参阅[内部响应式状态](#internal-reactive-state)了解相关详细信息，。

## 公共响应式属性{#declare}

可以使用装饰器或者静态 `properties` 字段定义组件的公共响应式属性。

不管使用哪种方式，你都可以传入一个对象来配置属性的一些特性。

### 使用装饰器定义属性 {#declare-with-decorators}

在一个类中使用 `@property` 装饰器来声明一个响应式属性。

```ts
class MyElement extends LitElement {
  @property({type: String})
  mode: string;

  @property({attribute: false})
  data = {};
}
```

`@property` 装饰器的参数是一个[选项对象](#property-options)。如果省略选项对象参数的话，Lit会为所有选项指定默认值。

<div class="alert alert-info">

**使用装饰器** 装饰器是一个还处于提案阶段的 Javasript 特性，因此，如果你需要一个像 Babel 或者 Typescript 那样的编译器才能使用它。请参阅[开启装饰器]({{baseurl}}/docs/components/decorators/#enabling-decorators)了解详情.

</div>

### 在静态属性类字段中声明属性

在静态属性类字段 `properties` 中声明属性:

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

### 在定义属性时需要避免一些类字段的问题{#avoiding-issues-with-class-fields}

[类字段](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Public_class_fields)与响应式属性的交互存在问题。类字段被定义在元素实例上，而响应式属性被定义为元素原型上的访问器。根据 JavaScript 的规则，实例属性的访问顺序优先于原型属性，也就是说，实例属属性会隐藏原型属性。所以当我们使用类字段时，响应式属性访问器不起作用。设置属性后，元素不会更新。

在 **JavaScript** 中，你**不应该使用类字段**来定义响应式属性，而是（必须）在元素的构造函数中初始化属性。

```js
class MyElement extends LitElement {
  static properties = {
    mode: {type: String},
    data: {attribute: false},
  };

  // 译者注：使用类字段声明的属性将被定义到元素实例上
  private mode = "some thing";

  constructor() {
    super();
    // 译者注：在构造函数中直接初始化的属性，将被Lit封装为访问器（getter/setter)
    // 然后放到元素的原型上，从而使属性具有响应式
    this.data = {};
  }
}
```

如果你在使用 **Typescript** 的话，**可以使用类字段**来声明响应式属性，但请记得把 `tsconfig` 中的 `useDefineForClassFields` 设置为 `false`。虽然[有些情况下](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)它默认就是 `false`，但还是建议明确地把它设置为 `false`。

如果你在使用 **Babel** 编译 JavaScript 的话，也**可以使用类字段**来声明响应式属性。同样的，你需要把 babel 的配置文件 `babelrc` 中的 `assumptions` 的` setPublicClassFields` 设置为 `true`。注意：对于旧版本的 Babel，你还需要引入插件 `@babel/plugin-proposal-class-properties`。

```js
assumptions = {
  "setPublicClassFields": true
};

plugins = [
  ["@babel/plugin-proposal-class-properties"],
];
```

请参阅[避免类字段和装饰器的问题]({{baseurl}}/docs/components/decorators/#avoiding-issues-with-class-fields)来了解更多关于如何使用装饰器装饰类属性的信息。

### 属性选项

属性选项对象可以包含下列属性：

<dl>
<dt>

`attribute`

</dt>
<dd>

设置 property 是否与 attribute 关联，或者指定与 property 相关联的 attribute 的名称。默认值是true。如果 `attribute` 为false的话，则忽略 `converter`、`reflect` 和 `type` 选项。请参阅[设置属性名称](#observed-attributes)了解有关详细信息。

</dd>
<dt>

`converter`

</dt>
<dd>

设置用来在 property 和 attribute 之间做转换的[自定义转换器](#conversion-converter)。如果不设置的话，则使用[默认属性转换器](#conversion-type)。

</dd>
<dt>

`hasChanged`

</dt>
<dd>

设置一个函数用来检测 property 是否发生改变，如果该函数返回 true，则触发一个更新。无论何时，只要 property 被设置了新的值，该函数就会被自动调用。如果未指定，LitElement 将使用严格的不等式检查（`newValue !== oldValue`）来确定property值是否发生改变。请参阅[自定义更改检测](#haschanged)了解有关详细信息。

</dd>
<dt>

`noAccessor`

</dt>
<dd>

设置是否禁止生成默认属性访问器。这个选项很少需要。默认值为false，也就是默认生成属性访问器。请参阅[防止Lit生成属性访问器](#accessors-noaccessor)了解有关详细信息。

</dd>
<dt>

`reflect`

</dt>
<dd>

设置 property 属性值是否反射回关联的 atrribute。默认值：false。有关详细信息，请参阅[启用属性反射](#reflected-attributes)了解有关详细信息。

</dd>
<dt>

`state`

</dt>
<dd>

设置该 property 为内部响应式状态。内部响应式状态也会像公共响应式属性那样触发更新，但 Lit 不会为其生成 attribute，因此用户不能从组件外部访问它。当该选项设置为 true 的时候，等效于使用 `@state` 装饰器。请参阅[内部响应式状态](#internal-reactive-state)了解有关详细信息。

</dd>
<dt>

`type`

</dt>
<dd>

当将值为字符串的 attribute 转换为 property 时，Lit 的默认属性转换器会将字符串解析为 type 指定的类型，反之，将 property 反射为 attribute 时也是如此。如果设置了 `converter`，则该选项将被传递给转换器。如果 `type` 未指定，默认转换器将其视为 `type: String`。请参阅[使用默认转换器](#conversion-type)了解更多信息。

使用 TypeScript 时，该选项通常应和为属性（property）声明的 TypeScript 类型一致。然而，`type` 选项被 Lit 的*运行时*用于实现字符串序列化/反序列化，不应和 Typescript 的*类型检测*机制混淆。

</dd>

省略选项对象或者传入一个空的选项对象相当于给所有的选项指定默认值。

## 内部响应式属性

*内部响应式状态*指的是不属于组件公共 API 的响应式属性。这些状态 property 没有与之对应的 attibute，并且不允许从组件外部使用，只能由组件本身设置。

可以使用 `@state` 装饰器声明一个内部响应式状态：

```ts
@state()
protected _active = false;
```

也可以使用静态 `properties` 类字段声明内部响应式状态，做法是将属性的 `state` 选项设置为 true。

```js
static properties = {
  _active: {state: true}
};

constructor() {
  this._active = false;
}
```

不应从组件外部引用内部响应式状态。在 TypeScript 中，这些属性应标记为 private 或 protected。在 Javascript 中，我们建议约定使用下划线（`_`）作为 private 或者 protected 属性的前缀。

内部响应式状态除了没有与之关联的 atrribute 之外，其他的和公共响应式属性 property 没有什么不同。**我们可以给内部响应式状态指定的唯一选项就是 `hasChanged` 函数**。

`@state` 装饰器还可以告诉代码压缩工具：代码压缩过程中可以改变内部响应式状态的属性名。

## 属性（property）改变的时候会发生什么 {#when-properties-change}

属性发生改变会触发一个响应式更新周期，进而触发组件重新渲染其模板。

下列步骤是属性发生变化后的过程：

1.  属性的 setter 被调用。 
1.  setter 调用组件的 `requestUpdate` 的方法。 
1.  比较属性的旧值和新值。如果设置了属性的 `hasChanged` 函数，那么就调用 `hasChanged` 函数并传入属性的旧值和新值进行比较。
1.  如果检测到属性值发生了改变，就安排一次异步更新。但是如果此前已经安排了一次更新但是还没有执行，则不再安排更新。（译者注：一个同步任务可能会多次更改属性，而安排的异步更新只能在同步任务完成后执行，因此在同步任务中第二次更改属性去安排更新时，就会存在一个已安排但未执行的更新）。
1.  调用组件的 `update` 方法，将组件的 property 反射回 attribute 并且更新组件的模板。

有许多方法可以绑定生命周期钩子和修改响应式更新周期。请参阅[响应式生命周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle)了解更多信息。

请参阅[自定义更新检测](#haschanged)了解更多信息。

## Attributes {#attributes}

虽然 property 非常适合接收 JavaScript 数据作为输入，但 attribute 却是 HTML 允许从标签配置元素的标准方式，而无需使用 JavaScript 来设置 property。为响应式属性提供 property 和 attribute 接口是 Lit 组件能适应各种环境的关键所在，包括那些没有客户端模板引擎的环境，例如：从CMS提供的静态 HTML 页面。

默认情况下，Lit 会给每个公共响应式属性 property 设置一个被观察的 attribute，每当 attribute 发生变化的时候自动更新 property 的值。同时，property 的值也可以（可选地）反射回 attribute。

虽然元素的 property 可以是任何类型，但 attribute 却始终是字符串，这就会影响到非字符串的 property 的[观察属性](#observed-attributes)和[反射属性](#reflected-attributes)。

  * 要**观察** attribute（从 attribute 设置 property），attribute 值必须从字符串转换为 property 的匹配类型。

  * 要**反射** attribute（从 property 设置 attribute），必须将 property 值转换为字符串。

### 设置属性（attribute）名 {#observed-attributes}

默认情况下，Lit 为所有公共响应式属性创建相应的观察属性（observed attribute）。观察属性的名称是 property 的名称，并且是小写的：

{% switchable-sample %}

```ts
// 观察属性的名称是 "myvalue"
@property({ type: Number })
myValue = 0;
```

```js
// 观察属性的名称是 "myvalue"
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

{% endswitchable-sample %}

可以通过设置 `attribute` 为别的字符串来设置观察属性为另外的名称。

{% switchable-sample %}

```ts
// 观察属性的名称被设置为 my-name
@property({ attribute: 'my-name' })
myName = 'Ogden';
```

```js
// 观察属性的名称被设置为 my-name
static properties = {
  myName: { attribute: 'my-name' },
};

constructor() {
  super();
  this.myName = 'Ogden'
}
```

{% endswitchable-sample %}

可以设置 `attribute` 为 `false` 来阻止创建 property 的时候自动创建观察属性，这样 property 就不会从标签中的 attribute 进行初始化，并且 attribute 的更改也不会影响到 property。

{% switchable-sample %}

```ts
// 不为这个 property 设置观察属性
@property({ attribute: false })
myData = {};
```

```js
// 不为这 个property 设置观察属性
static properties = {
  myData: { attribute: false },
};

constructor() {
  super();
  this.myData = {};
}
```

{% endswitchable-sample %}

内部响应式状态永远没有与之关联的 attribute。

写在标签中的观察属性可以用来为 property 做初始化。例如：

```html
<my-element myvalue="99"></my-element>
```

### 使用默认转换器 {#conversion-type}

Lit 提供了用于处理 `String`, `Number`, `Boolean`, `Array`, and `Object` 等类型的默认属性转换器。

可以在属性声明中设置 `type` 选项来指定默认转换器。

{% switchable-sample %}

```ts
// 使用默认转换器
@property({ type: Number })
count = 0;
```

```js
// 使用默认转换器
static properties = {
  count: { type: Number },
};

constructor() {
  super();
  this.count = 0;
}
```

{% endswitchable-sample %}

如果没有为属性指定 type 或者自定义的转换器，则使用默认值 `type: String`。

下方表格显示了各种默认转换器是如何工作的。

**从 attribute 到 property**

| Type    | 转换 |
|:--------|:-----------|
| `String`  | 如果存在关联的 attribute，则直接将 attribute 的值设置给 property。 |
| `Number`  | 如果存在关联的 attribute，则将 property 的值设置为 `Number(attributeValue)`。 |
| `Boolean` | 如果存在关联的 attribute，则将 property 的值为 true，否则设置为 false。 |
| `Object`, `Array` | 如果存在关联的 attribute，则将 property 的值设置为 `JSON.parse(attributeValue)`。 |

除 `Boolean` 类型外，如果元素没有关联的 attribute，就用默认值给 property 赋值，如果没有设置默认值，就用 `undefined` 赋值。

**从 property 到 attribute**

| Type    | 转换 |
|:--------|:-----------|
| `String`, `Number` | 如果 property 被定义且值不为 null，则直接将 property 的值设置给 attribute。<br>如果 property 是 null 或者未定义，则直接移除attribute。|
| `Boolean` | 如果 property 是 truthy 值，则创建 attribute 并且设置其值为一个空字符串。<br>如果 property 是 falsy 值，则直接移除 attribute。|
| `Object`, `Array` | 如果 property 被定义且值不为n ull，则将 `JSON.stringify(propertyValue)` 设置给 attribute。<br>如果 property 是 null 或者未定义，则直接移除 attribute。|


### 提供自定义转换器 {#conversion-converter}

在声明属性（property）的时候，可以通过 `converter` 选项来指定属性的自定义转换器：

```js
myProp: {
  converter: // 自定义属性转换器
}
```

`converter` 选项可以是一个对象或者一个函数，如果是对象的话，该对象可以包含 `fromAttribute` 和 `toAttribute` 两个关键字：

```js
prop1: {
  converter: {
    fromAttribute: （value, type) => {
      // `value` 是一个字符串
      // 将 `value` 转换为 `type` 指定的类型的值，并返回
    },
    toAttribute: （value, type) => {
      // `value` 是一个 `type` 指定的类型的值
      // 将 `value` 转换成 string 类型并返回
    }
  }
}
```

如果 `converter` 是一个函数，那么将 `fromAttribute` 设置为这个函数：

```js
myProp: {
  converter: （value, type) => {
    // `value` 是一个字符串
    // 将 `value` 转换为 `type` 指定的类型的值，并返回
  }
}
```

如果没有给 `toAttribute` 设置函数用于反射属性，就使用默认转换器转换 property 的值然后设置给 attribute。

如果 `toAttribute` 返回 `null` 或者 `undefined`，则直接移除 attribute。

### 开启反射属性 {#reflected-attributes}

你可以配置 property 让它无论任何时候发生改变都会将其值反射回它的[关联属性（attribute）](#observed-attributes)，反射属性非常有用，因为 attribute 对于CSS，DOM API(如：`querySelector`）是可见的。

例如:

```js
// 名为 "active" 的 property 的值将反射给名为 "active" 的 attribute
active: {reflect: true}
```

当 property 发生变化时，Lit 会按照[使用默认转换器](#conversion-type)或[设置自定义转换器](#conversion-converter)中的说明设置与之关联的 attribute 的值。

{% playground-example "properties/attributereflect" "my-element.ts" %}

attribute 通常应当被用于向元素输入内容，而不是受元素本身的控制，因此应谨慎地将 property 反射到 attribute。

虽然说反射属性对于样式和无障碍等是必要的特性，但我们还是建议谨慎使用。随着平台添加[`:state`伪选择器](https://wicg.github.io/custom-state-pseudo-class/)和[无障碍对象模型](https://wig.github.io/aom/spec/)等特性，我们将有更多的选择。

我们不推荐将类型为对象或数组的 property 反射回 attribute，因为这样做会把一个大对象序列化到 DOM 上，从而影响性能。

<div class="alert alert-info">

**Lit 在更新期间跟踪反射状态。** 你可能已经意识到，如果 property 更改反射到 attribute，并且 attribute 更改会更新 property，这就可能会陷入死循环。但是，Lit 会在更新期间跟踪反射状态，确定何时专门设置 property 和 attribute，防止发生死循环发生。

</div>

## 自定义属性（property）访问器 {#accessors}

默认情况下，LitElement 会为所有的响应式属性生成一个 getter/setter 对，setter 将会在设置属性的时候被调用：

{% switchable-sample %}

```ts
// 声明一个属性
@property()
greeting: string = 'Hello';
...
// 然后给属性赋值
this.greeting = 'Hola'; // 调用为greeting生成的属性访问器
```

```js
// 声明一个属性
static properties = {
  greeting: {},
}
constructor() {
  this.super();
  this.greeting = 'Hello';
}
...
// 然后给属性赋值
this.greeting = 'Hola'; // 调用为greeting生成的属性访问器
```

{% endswitchable-sample %}

生成的属性访问器会自动调用 `requestUpdate()`，如果更新尚未开始，则启动更新（译者注：准确的说应该是如果不存在已安排的异步更新，则安排一个）。

### 创建自定义属性（property）访问器 {#accessors-custom}

你可以自己定义 getter/setter 对来指定读取和设置属性的时候如何工作，例如：

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

想要通过 `@property` 或 `@state` 来使用自定义的属性访问器的话，只需要把装饰器放在 getter 之上就可以，就上上面例子那样。

Lit 生成的 setter 会自动调用 `requestUpdate()` 方法。因此，如果你自己定义 setter 的话，你就必须手动调用 `requestUpdate()` 并传入属性的名称和属性的旧值。

大多数情况下，**你没必要创建自定义属性访问器。** 我们推荐使用[`willUpdate`]({{baseurl}}/docs/components/lifecycle/#willupdate)回调来根据现有属性计算新值，因为`willUpdate`允许你在更新周期内更新属性值而不会触发一个额外的更新。元素更新完成后，我们推荐使用[`updated`]({{baseurl}}/docs/components/lifecycle/#updated)回调来执行一个自定义的后续操作。自定义的 setter 仅被使用在极少数的场景，如：当同步验证用户输入是一件非常重要的事情的时候。

如果你的类已经为属性定义了访问器，那么 Lit 将不会再为它生成访问器，否则将为他们创建默认属性访问器，即使父类已经定义了同名属性或者同名属性的访问器。

### 避免 Lit 生成属性访问器 {#accessors-noaccessor}

少数情况下，子类可能需要修改或新增存在于父类的的属性的选项。

为了避免 Lit 生成属性访问器覆盖父类定义的访问器，可以在属性声明中将 `noAccessor` 设置为 `true`。

```js
static properties = {
  myProp: { type: Number, noAccessor: true }
};
```

如果你已经给属性创建自定义访问器了的话，就没必要设置 `noAccessor` 了。

## 自定义更新检测 {#haschanged}

所有响应式属性都有一个 `hasChanged()` 函数，只要属性被设置，该函数就会被调用。

`hasChanged` 的职责是比较属性的旧值和新值，并评估属性是否已更改。如果 `hasChanged()` 返回 true 并且尚未安排元素更新，Lit 将安排一个异步更新。请参阅[响应式更新周期]({{baseurl}}/docs/components/lifecycle/#reactive-update-cycle)了解更多有关更新的信息。

`hasChanged()` 的默认实现使用严格的不等式比较：如果 `newVal !== oldVal`，则 `hasChanged()` 返回 `true`。

在声明属性的时候，在选项中为属性自定义 `hasChanged()`：

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

在下面的例子中，值为偶数的时候 `hasChanged()` 返回 true。

{% playground-example "properties/haschanged" "my-element.ts" %}
