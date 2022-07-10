---
title: 内置指令
eleventyNavigation:
  key: 内置指令
  parent: 模板
  order: 5
versionLinks:
  v1: lit-html/template-reference/#built-in-directives
---

指令是通过自定义表达式渲染方式来扩展 Lit 的函数。

Lit 包含许多内置指令，可满足各种渲染需求：

<table class="directory">
  <tr><th>指令</th><th>概括</th></tr>
  <tr class="subheading"><td colspan="2">

  样式

  </td></tr>
  <tr>
  <td>

  [`classMap`](#classmap)

  </td>
  <td>通过一个对象给元素设置一组 class。</td>
  </tr>

  <tr>
  <td>

  [`styleMap`](#stylemap)

  </td>
  <td>

  通过一个对象给元素设置一组样式属性。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  循环与条件式

  </td></tr>

  <tr>
  <td>

  [`when`](#when)

  </td>
  <td>根据条件渲染两个模板中的其中一个。</td>
  </tr>

  <tr>
  <td>

  [`choose`](#choose)

  </td>
  <td>根据 key 值渲染多个模板中的其中一个。</td>
  </tr>

  <tr>
  <td>

  [`map`](#map)

  </td>
  <td>使用一个函数来转换可迭代对象。</td>
  </tr>

  <tr>
  <td>

  [`repeat`](#repeat)

  </td>
  <td>将可迭代对象渲染为 DOM 节点，并指定可选的键开启数据差异比较和 DOM 稳定性。</td>
  </tr>

  <tr>
  <td>

  [`join`](#join)

  </td>
  <td>交错拼接连接器和可迭代对象的值。</td>
  </tr>

  <tr>
  <td>

  [`range`](#range)

  </td>
  <td>创建一个包含一个数字序列的可迭代对象，对于迭代特定次数的场景很有用。</td>
  </tr>

  <tr>
  <td>

  [`ifDefined`](#ifdefined)

  </td>
  <td>值为 defined 时设置 attribute，值为 undefined 时移除 attribute。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  缓存和变化检测

  </td></tr>

  <tr>
  <td>

  [`cache`](#cache)

  </td>
  <td>在模板更新时，缓存已渲染的 DOM 而不是丢弃。</td>
  </tr>

  <tr>
  <td>

  [`guard`](#guard)

  </td>
  <td>仅在其依赖项之一发生更改时重新计算模板，通过防止不必要的工作来优化渲染性能。</td>
  </tr>

  <tr>
  <td>

  [`live`](#live)

  </td>
  <td>当 attribute 和 property 与 DOM 的实时值不一样时，设置其为实时值，而不是它们上一个渲染的值。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  引用已渲染的 DOM

  </td></tr>

  <tr>
  <td>

  [`ref`](#ref)

  </td>
  <td>获得一个模板中已渲染的元素的引用。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  渲染特殊值

  </td></tr>

  <tr>
  <td>

  [`templateContent`](#templatecontent)

  </td>
  <td>

  渲染 `<template>` 元素的内容。

  </td>
  </tr>

  <tr>
  <td>

  [`unsafeHTML`](#unsafehtml)

  </td>
  <td>渲染字符串为 HTML 而不是文本。</td>
  </tr>

  <tr>
  <td>

  [`unsafeSVG`](#unsafesvg)

  </td>
  <td>渲染字符串为 SVG 而不是文本。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  异步渲染

  </td></tr>

  <tr>
  <td>

  [`until`](#until)

  </td>
  <td>渲染占位符直到一个或多个promise resolve为止。</td>
  </tr>

  <tr>
  <td>

  [`asyncAppend`](#asyncappend)

  </td>
  <td>当一个 `AsyncIterable` yield 时，向 DOM 追加其 yield 值。</td>
  </tr>

  <tr>
  <td>

  [`asyncReplace`](#asyncreplace)

  </td>
  <td>当 `AsyncIterable` yield 时，将最新的值渲染到 DOM 中。</td>
  </tr>
</table>

<div class="alert alert-info">

**只打包你用到的东西。** 这些指令之所以被称为“内置”指令，是因为它们是 Lit 包的一部分。但是每个指令都是一个单独的模块，因此你的应用程序应该只打包导入的指令。

</div>

你也可以构建你自己的指令。请参阅 [自定义指令]({{baseurl}}/docs/templates/custom-directives/) 了解更多信息。

## 样式 {#styling}

### classMap

通过一个对象给元素设置一组 class。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {classMap} from 'lit/directives/class-map.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
classMap(classInfo: {[name: string]: string | boolean | number})
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

`class` 属性表达式（必须是 `class` 属性的唯一表达式）。

</td>
</tr>
</tbody>
</table>

`classMap` 指令使用 `element.classList` API 根据用户传递的对象来高效地添加和删除元素的类。该对象的每一个 key 都被视为一个类名，如果与 key 关联的值是真值，则该类被添加到元素中。在后续的渲染中，
如果某个 key 对应的值变成假值或不再存在于对象中，那么先前设置的与之关联的类也将被删除。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const classes = { enabled: this.enabled, hidden: false };
    return html`<div class=${classMap(classes)}>Classy text</div>`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    enabled: {type: Boolean},
  };

  constructor() {
    super();
    this.enabled = false;
  }

  render() {
    const classes = { enabled: this.enabled, hidden: false };
    return html`<div class=${classMap(classes)}>Classy text</div>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

`classMap` 必须是 `class` 属性中的唯一表达式，但它可以与静态值结合：

```ts
html`<div class="my-widget ${classMap(dynamicClasses)}">Static and dynamic</div>`;
```

在 [游乐场中](/playground/#sample=examples/directive-class-map) 探索更多有关 `classMap` 的内容。

### styleMap

通过一个对象给元素设置一组样式属性。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {styleMap} from 'lit/directives/style-map.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
styleMap(styleInfo: {[name: string]: string | undefined | null})
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

`style` 属性表达式（必须是 `style` 属性的唯一表达式）。

</td>
</tr>
</tbody>
</table>

`styleMap` 指令使用 `element.style` API 根据用户传递的对象来高效地添加和删除元素的內联样式。该对象的每一个 key 被视为一个样式属性名，与之关联的值则是属性的值。在后续的渲染中，
如果某个 key 对应的值变成 `undefined` 或 `null`，那么先前设置的样式属性也将被删除（设置为 `null`）。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const styles = { backgroundColor: this.enabled ? 'blue' : 'gray', color: 'white' };
    return html`<p style=${styleMap(styles)}>Hello style!</p>`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    enabled: {type: Boolean},
  };

  constructor() {
    super();
    this.enabled = false;
  }

  render() {
    const styles = { backgroundColor: this.enabled ? 'blue' : 'gray', color: 'white' };
    return html`<p style=${styleMap(styles)}>Hello style!</p>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

对于包含破折号的 CSS 属性，你可以使用驼峰型大小写等效写法，或者将属性名放在引号中。例如，你可以将 CSS 属性 `font-family` 写为 `fontFamily` 或 `'font-family'`：

```js
{ fontFamily: 'roboto' }
{ 'font-family': 'roboto' }
```

通过将整个属性名放在引号中来引用 CSS 自定义属性，例如 `--custom-color`：

```js
{ '--custom-color': 'steelblue' }
```

`styleMap` 必须是 `style` 属性中的唯一表达式，但它可以与静态值结合：


```js
html`<p style="color: white; ${styleMap(moreStyles)}">More styles!</p>`;
```

在 [游乐场中](/playground/#sample=examples/directive-style-map) 探索更多有关 `styleMap` 的内容。

## 循环与条件式 {#loops-and-conditionals}

### when

根据条件渲染一个或多个模板。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {when} from 'lit/directives/when.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
when<T, F>(
  condition: boolean,
  trueCase: () => T,
  falseCase?: () => F
)
```
</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何地方

</td>
</tr>
</tbody>
</table>

当`condition`为真时，返回调用`trueCase()`的结果，否则如果定义了 `falseCase` 则返回调用 `falseCase()` 的结果。

这是一个便捷的三元表达式包装器，使其成为在没有 else 的情况下编写内联条件的更好方式。

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${when(this.user, () => html`User: ${this.user.username}`, () => html`Sign In...`)}
    `;
  }
}
```

### choose

根据给定的 `value` 从 case 列表中选择匹配的 case 并计算其模板函数。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {choose} from 'lit/directives/choose.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
choose<T, V>(
  value: T,
  cases: Array<[T, () => V]>,
  defaultCase?: () => V
)
```
</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何位置

</td>
</tr>
</tbody>
</table>

case 的结构为 `[caseValue, func]`。 `value` 与 `caseValue` 通过严格的等值比较进行匹配。 第一个匹配到的 case 就被会选中。 case 值可以是任何类型，包括原始值、对象和 symbol。

这类似于 switch 语句，但 choose 只是一个表达式并且没有 fallthrough 机制。

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${choose(this.section, [
        ['home', () => html`<h1>Home</h1>`],
        ['about', () => html`<h1>About</h1>`]
      ],
      () => html`<h1>Error</h1>`)}
    `;
  }
}
```

### map

返回一个可迭代对象，其中包含对 `items` 中的每个值调用 `f(value)` 的结果。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {map} from 'lit/directives/map.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
map<T>(
  items: Iterable<T> | undefined,
  f: (value: T, index: number) => unknown
)
```
</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何位置

</td>
</tr>
</tbody>
</table>

`map()` 是 [for/of 循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of) 的简单包装器，它使得在表达式中使用可迭代对象变得更容易一些。 `map()` 总是就地更新任何已创建的 DOM - 它不做任何差异比较或 DOM 移动。如果需要差异比较或 DOM 移动，请参阅 [repeat](#repeat)。 `map()` 比 `repeat()` 更小更快，所以如果你不需要差异比较 和 DOM 稳定性，`map()` 会更合适。

```ts
class MyElement extends LitElement {
  render() {
    return html`
      <ul>
        ${map(items, (i) => html`<li>${i}</li>`)}
      </ul>
    `;
  }
}
```

### repeat

将可迭代对象渲染为 DOM 节点，并指定可选的键开启数据差异比较和 DOM 稳定性。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {repeat} from 'lit/directives/repeat.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
repeat(items: Iterable<T>, keyfn: KeyFn<T>, template: ItemTemplate<T>)
repeat(items: Iterable<T>, template: ItemTemplate<T>)
type KeyFn<T> = (item: T, index: number) => unknown;
type ItemTemplate<T> = (item: T, index: number) => unknown;
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

从一个可迭代对象重复生成一系列值（通常是 `TemplateResults`），当可迭代对象改变时高效地更新这些项。当提供 `keyFn` 时，通过在需要时移动已生成的 DOM 在更新之间维护 key 与 DOM 之间的关联。通常，使用 `repeat` 是最高效的方法，因为它对插入和删除执行最少的不必要工作。

如果你不使用 `keyFn`，你应该考虑使用`map()`](#map)。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  items: Array<{id: number, name: string}> = [];

  render() {
    return html`
      <ul>
        ${repeat(this.items, (item) => item.id, (item, index) => html`
          <li>${index}: ${item.name}</li>`)}
      </ul>
    `;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    items: {},
  };

  constructor() {
    super();
    this.items = [];
  }

  render() {
    return html`
      <ul>
        ${repeat(this.items, (item) => item.id, (item, index) => html`
          <li>${index}: ${item.name}</li>`)}
      </ul>
    `;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

如果没有提供 `keyFn`，`repeat` 将类似于一个简单的从项到值的 map ，并且 DOM 将可能被重用于不同的项。

请参阅 [何时使用 map 或 repeat]({{baseurl}}/docs/templates/lists/#when-to-use-map-or-repeat) 进行讨论何时使用 `repeat` 以及何时使用标准 JavaScript 流控制。

在 [游乐场中](/playground/#sample=examples/directive-repeat) 探索更多有关 `repeat` 的内容。

### join

返回一个包含 `items` 中的值与 `joiner` 值交错的可迭代对象。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {join} from 'lit/directives/join.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
join<I, J>(
  items: Iterable<I> | undefined,
  joiner: J
): Iterable<I | J>;

join<I, J>(
  items: Iterable<I> | undefined,
  joiner: (index: number) => J
): Iterable<I | J>;
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何位置

</td>
</tr>
</tbody>
</table>

```ts

class MyElement extends LitElement {

  render() {
    return html`
      ${join(
        map(menuItems, (i) => html`<a href=${i.href}>${i.label}</a>`),
        html`<span class="separator">|</span>`
      )}
    `;
  }
}
```

### range

返回从 `start` 到 `end`（不包括）以 `step` 递增的整数的可迭代对象。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {range} from 'lit/directives/range.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
range(end: number): Iterable<number>;

range(
  start: number,
  end: number,
  step?: number
): Iterable<number>;

```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何位置

</td>
</tr>
</tbody>
</table>

```ts

class MyElement extends LitElement {

  render() {
    return html`
      ${map(range(8), (i) => html`${i + 1}`)}
    `;
  }
}
```

### ifDefined

如果值为 defined，则设置一个 attribute， 如果值为 undefined， 则移除 attribute。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {ifDefined} from 'lit/directives/if-defined.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
ifDefined(value: unknown)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

Attribute 表达式

</td>
</tr>
</tbody>
</table>

对于 attribute 部分，如果值是 defined ，则设置 attribute，如果值是 undefined（`undefined` 或 `null`），则删除 attribute。对于其他部分，该指令是无效。

当一个属性值中存在多个表达式时，如果 _任意_ 表达式使用 `ifDefined` 且计算结果为 `undefined`/`null`，则该属性将被删除。这对于设置 URL 属性特别有用，如果未定义 URL 的必需部分，则不应设置该属性，以防止 404。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  filename: string | undefined = undefined;

  @property()
  size: string | undefined = undefined;

  render() {
    // 如果 size 或 filename 是 undefined，src 属性就不会被渲染
    return html`<img src="/images/${ifDefined(this.size)}/${ifDefined(this.filename)}">`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    filename: {},
    size: {},
  };

  constructor() {
    super();
    this.filename = undefined;
    this.size = undefined;
  }

  render() {
    // 如果 size 或 filename 是 undefined，src 属性就不会被渲染
    return html`<img src="/images/${ifDefined(this.size)}/${ifDefined(this.filename)}">`;
  }
}
customElements.define('my-element', MyEleent);
```

{% endswitchable-sample %}

在 [游乐场中](/playground/#sample=examples/directive-if-defined) 探索更多有关 `ifDefined` 的内容。

## 缓存和改变检测 {#caching-and-change-detection}

### cache

在更改模板时缓存已渲染的 DOM 而不是丢弃 DOM。当你频繁地在大型模板之间切换时，可以使用该指令来优化渲染性能。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {cache} from 'lit/directives/cache.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
cache(value: TemplateResult|unknown)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

当传递给 `cache` 的值在一个或多个 `TemplateResult` 之间变化时，给定模板的已渲染 DOM 节点在不使用时会被缓存。
当模板改变时，指令会在切换到新值之前缓存 _当前的_ DOM 节点，并在切换回之前渲染的值时从缓存中恢复它们，而不是重新创建 DOM 节点。

{% switchable-sample %}

```ts
const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  data = {showDetails: true, /*...*/ };

  render() {
    return html`${cache(this.data.showDetails
      ? detailView(this.data)
      : summaryView(this.data)
    )}`;
  }
}
```

```js
const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

class MyElement extends LitElement {
  static properties = {
    data: {},
  };

  constructor() {
    super();
    this.data = {showDetails: true, /*...*/ };
  }

  render() {
    return html`${cache(this.data.showDetails
      ? detailView(this.data)
      : summaryView(this.data)
    )}`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

当 Lit 重新渲染一个模板时，它只更新变更的部分：它只会创建或删除必要的DOM。但是当你从一个模板切换到另一个模板时，Lit 会移除旧的 DOM 和创建新的 DOM 树。

`cache` 指令会为给定的表达式和输入模板缓存已生成的 DOM。在上面的示例中，它缓存了 `summaryView` 和 `detailView` 模板的 DOM。当你从一个视图切换到另一个视图时，Lit 会换成新视图的缓存版本并使用最新数据对其进行更新。当这些视图频繁切换时，这可以提高渲染性能。

在 [游乐场中](/playground/#sample=examples/directive-cache) 探索更多有关 `cache` 的内容。

### guard

仅在其依赖项之一发生更改时重新计算模板，通过避免不必要的工作来优化渲染性能。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {guard} from 'lit/directives/guard.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
guard(dependencies: unknown[], valueFn: () => unknown)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任何表达式

</td>
</tr>
</tbody>
</table>

渲染由 `valueFn` 返回的值，并且仅在依赖项之一更改时重新执行 `valueFn`。

参数:

-   `dependencies` 是一个用于监视变化的值的数组。
-   `valueFn` 是一个返回可渲染值的函数。

`guard` 对不可变数据模式很有用，它可以避免在数据更新之前进行开销很大的工作。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  value: string = '';

  render() {
    return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    value: {},
  };

  constructor() {
    super();
    this.value = '';
  }

  render() {
    return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在这个示例中，开销很大的 `calculateSHA` 函数只有在 `value` 属性改变的时候才会执行。

在 [游乐场中](/playground/#sample=examples/directive-guard) 探索更多有关 `guard` 的内容。

### live

当 attribute 和 property 与 DOM 的实时值不一样时，设置其为实时值，而不是它们上一个渲染的值。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {live} from 'lit/directives/live.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
live(value: unknown)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

Attribute 或者 property 表达式

</td>
</tr>
</tbody>
</table>

当判断是否需要更新值的时候，检查表达式的值和 _实时_ DOM 值是否不一样，而不是 Lit 的默认方式-检查与上一个设置的值是否不一样。

这种方式对于那些 DOM 值可能从 Lit 组件外部修改的场景很有用。例如，当使用一个表达式去设置 `<input>` 元素的 `value` 属性，内容可编辑元素的 text，或者一个可以修改自己 property 或者 attribute 的自定义组件。

在这些场景下，如果 DOM 值发生改变，但是通过 Lit 表达式设置的值没有发生改变，Lit 将不知道是要去更新 DOM 值而保持原状。如果这不是你想要的 - 你想到的是无论如何都直接使用绑定的值覆盖 DOM 值， 那么就使用 `live()` 指令。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  data = {value: 'test'};

  render() {
    return html`<input .value=${live(this.data.value)}>`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    data: {},
  };

  constructor() {
    super();
    this.data = {value: 'test'};
  }

  render() {
    return html`<input .value=${live(this.data.value)}>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

`live()` 对实时 DOM 值执行严格的等值检测，如果新的绑定值等于实时的 DOM 值，那就什么都不做。这就意味着如果绑定的表达式存在类型转换的话，就不应该使用 `live()`。如果你对 attribute 表达式使用 `live()` 指令，请确保传入的值是字符串类型。否则表达式在每次渲染时都会被更新。

在 [游乐场](/playground/#sample=examples/directive-live) 中探索 `live` 的更多内容。

## 渲染特殊值 {#rendering-special-values}

### templateContent

渲染 `<template>` 元素的内容。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {templateContent} from 'lit/directives/template-content.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
templateContent(templateElement: HTMLTemplateElement)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

Lit 模板是用 Javascript 编码的，因此它们可以嵌入 Javascript 表达式，使其成为动态的。如果你有一个静态 HTML `<template>` 需要引入到你的 Lit 模板中，那么你可以使用 templateContent 指令来克隆 template 元素中的内容并将其添加到你的 Lit 模板中。只要 template 元素引用在渲染之间不发生变化，后续渲染将不会重复上述操作。

<div class="alert alert-warning">

请注意，template 元素内容应由开发人员控制，不得由不受信任的字符串创建。不受信任内容的示例包括 query string 参数和用户输入的值。使用该指令渲染不信任的 template 元素内容可能导致 [跨站脚本攻击 (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) 漏洞。

</div>

{% switchable-sample %}

```ts
const templateEl = document.querySelector('template#myContent') as HTMLTemplateElement;

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return  html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
  }
}
```

```js
const templateEl = document.querySelector('template#myContent');

class MyElement extends LitElement {

  render() {
    return  html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在[游乐场](/playground/#sample=examples/directive-template-content)中探索更多 `templateContent` 的内容。

### unsafeHTML

将字符串渲染为 HTML 而不是文本。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
unsafeHTML(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

Lit 模板语法的一个关键特性是，只有源自模板字面量的字符串被解析为 HTML。因为模板字面量只能是
在受信任的脚本文件中编写，这可以作为抵御 XSS 攻击的自然保护措施，防止注入不受信任的 HTML。
但是，在某些情况下，HTML 不是源自需要在 Lit 模板中渲染的脚本文件，例如
从数据库中获取的可信 HTML 内容。 `unsafeHTML` 指令将
解析 HTML 等字符串并在 Lit 模板中渲染。

<div class="alert alert-warning">

请注意，传给 `unsafeHTML` 的字符串必须由开发人员控制，而不能是不受信任的内容。 不受信任内容的示例包括 query string 参数和来自用户输入的值。 `unsafeHTML` 指令渲染不受信任的内容
可能导致 [跨站脚本攻击 (XSS)](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC) 漏洞。

</div>

{% switchable-sample %}

```ts
const markup = '<h3>Some HTML to render.</h3>';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
  }
}
```

```js
const markup = '<h3>Some HTML to render.</h3>';

class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-unsafe-html) 中进一步探索 `unsafeHTML`。
### unsafeSVG

将字符串渲染为 SVG 而不是文本。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
unsafeSVG(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

与 [`unsafeHTML`](#unsafeHTML) 类似，可能会出现不是源自脚本文件但需要在 Lit 模板中渲染的 SVG 内容，例如：从数据库中获取的可信 SVG 内容示例。 `unsafeSVG` 指令
会将这样的字符串解析为 SVG 并将其渲染在 Lit 模板中。

<div class="alert alert-warning">

请注意，传给 `unsafeSVG` 的字符串必须由开发人员控制，而不能是不受信任的内容。 不受信任内容的示例包括 query string 参数和用户输入的值。 `unsafeSVG` 指令渲染不受信任的内容可能导致 [跨站脚本攻击 (XSS)](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%B6%B2%E7%AB%99%E6%8C%87%E4%BB%A4%E7%A2%BC) 漏洞。

</div>

{% switchable-sample %}

```ts
const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
  }
}
```

```js
const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-unsafe-svg) 中进一步探索 `unsafeSVG`。

## 引用已渲染的 DOM {#referencing-rendered-dom}

### ref

检索已渲染到 DOM 中的元素的引用。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {ref} from 'lit/directives/ref.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
ref(refOrCallback: RefOrCallback)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

元素表达式

</td>
</tr>
</tbody>
</table>

尽管 Lit 中的大多数 DOM 操作都可以在模板中以声明方式实现，但高级情况可能需要获取对模板中渲染的元素的引用并以命令方式对其进行操作。 这可能有用的常见示例包括聚焦表单控件或在容器元素上调用命令式 DOM 操作库。

当放置在模板中的元素上时，`ref` 指令将在渲染后检索对该元素的引用。 可以通过以下两种方式之一检索元素引用：通过传递`Ref`对象或通过回调。

`Ref` 对象充当元素引用的容器，可以使用 `ref` 模块中的 `createRef` 辅助方法创建。 渲染后，`Ref` 的 `value` 属性将被设置为元素，在渲染后的生命周期中可以像 `updated` 一样访问它。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  inputRef: Ref<HTMLInputElement> = createRef();

  render() {
    // 给 ref 指令传递一个 Ref 对象，该对象将在 .value 中保存当前元素
    return html`<input ${ref(this.inputRef)}>`;
  }

  firstUpdated() {
    const input = this.inputRef.value!;
    input.focus();
  }
}
```

```js
class MyElement extends LitElement {

  inputRef = createRef();

  render() {
    // 给 ref 指令传递一个 Ref 对象，该对象将在 .value 中保存当前元素
    return html`<input ${ref(this.inputRef)}>`;
  }

  firstUpdated() {
    const input = this.inputRef.value!;
    input.focus();
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

也可以给 `ref` 指令传入 ref 回调。 只要引用的元素发生更改就会调用该回调。 如果 ref 回调被渲染到不同的元素位置或在后续渲染中被删除，首先会使用 `undefined` 调用一次回调，然后再使用它被渲染到的新元素调用一次（如果有）。 请注意，在 `LitElement` 中，回调将被调用并自动绑定到宿主元素。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  render() {
    // 传递 ref 指令一个 change 回调
    return html`<input ${ref(this.inputChanged)}>`;
  }

  inputChanged(input?: HTMLInputElement) {
    input?.focus();
  }
}
```

```js
class MyElement extends LitElement {

  render() {
    // 传递 ref 指令一个 change 回调
    return html`<input ${ref(this.inputChanged)}>`;
  }

  inputChanged(input) {
    input?.focus();
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-ref) 中探索更多的 `ref`。

## 异步渲染 {#asynchronous-rendering}

### until

在一个或多个 promise resolve 之前，渲染占位内容

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {until} from 'lit/directives/until.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
until(...values: unknown[])
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

任意表达式

</td>
</tr>
</tbody>
</table>

接受一系列值，包括 Promises。 该指令会按值优先级顺序渲染内容，第一个参数具有最高优先级，最后一个参数具有最低优先级。 如果值是 Promise ，在它没有 resolve 之前，将渲染较低优先级的值。

The priority of values can be used to create placeholder content for async data. For example, a Promise with pending content can be the first (highest-priority) argument, and a non-promise loading indicator template can be used as the second (lower-priority) argument. The loading indicator renders immediately, and the primary content will render when the Promise resolves.

值的优先级可用于为异步数据创建占位符内容。 例如，带有待处理内容的 Promise 可以作为第一个（最高优先级）参数，而非 Promise 的加载提示模板可以作为第二个（低优先级）参数。 加载指示内容会立即渲染出来，而主要内容将在 Promise resolve 后呈现。

{% switchable-sample %}

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private content = fetch('./content.txt').then(r => r.text());

  render() {
    return html`${until(this.content, html`<span>Loading...</span>`)}`;
  }
}
```

```js
class MyElement extends LitElement {
  static properties = {
    content: {state: true},
  };

  constructor() {
    super();
    this.content = fetch('./content.txt').then(r => r.text());
  }

  render() {
    return html`${until(this.content, html`<span>Loading...</span>`)}`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-until) 中进一步探索 `until`。

### asyncAppend

当来自 `AsyncIterable` 的值被生成时，将他们添加到 DOM 中。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {asyncAppend} from 'lit/directives/async-append.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
asyncAppend(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

使用 `asyncAppend` 指令来渲染 [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)的值，会将新值添加到上一个之后。 请注意，异步的 generator 也实现了异步可迭代协议，因此也可以被 `asyncAppend` 指令使用。

{% switchable-sample %}

```ts
async function *tossCoins(count: number) {
  for (let i=0; i<count; i++) {
    yield Math.random() > 0.5 ? 'Heads' : 'Tails';
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private tosses = tossCoins(10);

  render() {
    return html`
      <ul>${asyncAppend(this.tosses, (v: string) => html`<li>${v}</li>`)}</ul>`;
  }
}
```

```js
async function *tossCoins(count) {
  for (let i=0; i<count; i++) {
    yield Math.random() > 0.5 ? 'Heads' : 'Tails';
    await new Promise((r) => setTimeout(r, 1000));
  }
}

class MyElement extends LitElement {
  static properties = {
    tosses: {state: true},
  };

  constructor() {
    super();
    this.tosses = tossCoins(10);
  }

  render() {
    return html`
      <ul>${asyncAppend(this.tosses, (v) => html`<li>${v}</li>`)}</ul>`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-async-append) 中进一步探索 `asyncAppend`。

### asyncReplace

将 `AsyncIterable` 生成的最新值渲染到 DOM 中。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td class="no-wrap-cell vcenter-cell">导入</td>
<td class="wide-cell">

```js
import {asyncReplace} from 'lit/directives/async-replace.js';
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">签名</td>
<td class="wide-cell">

```ts
asyncReplace(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td class="no-wrap-cell vcenter-cell">可用位置</td>
<td class="wide-cell">

子节点表达式

</td>
</tr>
</tbody>
</table>

与 [`asyncAppend`](#asyncappend) 类似，`asyncReplace` 也可以渲染 [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)的值，不同的是，`asyncReplace` 会用新值替换之前的值。

{% switchable-sample %}

```ts
async function *countDown(count: number) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private timer = countDown(10);

  render() {
    return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
  }
}
```

```js
async function *countDown(count) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

class MyElement extends LitElement {
  static properties = {
    timer: {state: true},
  };

  constructor() {
    super();
    this.timer = countDown(10);
  }

  render() {
    return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

在 [游乐场](/playground/#sample=examples/directive-async-replace) 中进一步探索 `asyncReplace`。

