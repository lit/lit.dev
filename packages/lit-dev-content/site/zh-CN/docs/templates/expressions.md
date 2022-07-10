---
title: 表达式
eleventyNavigation:
  key: 表达式
  parent: 模板
  order: 2
versionLinks:
  v1: components/templates/#bind-properties-to-templated-elements
---

Lit 模板可以包含被称为表达式的动态值。表达式可以是任何 JavaScript 表达式。Lit 在计算模板的同时也会计算表达式，并在渲染模板时包含表达式的结果。在 Lit 组件中，这意味着每次调用 `render` 方法都会计算表达式。

表达式只能放置在模板中的特定位置，如何解释表达式取决于它出现的位置。元素标签内的表达式本身会影响元素。元素内容中的子节点所在位置的表达式会被渲染为子节点或文本。

表达式的有效值因表达式出现的位置而异。通常，所有表达式都接受字符串和数字等原始值，一些表达式还支持其他值类型。此外，所有表达式都可以接受 _指令_，指令是可以自定义表达式的处理和渲染方式的特殊函数。有关详细信息，请参阅 [自定义指令]({{baseurl}}/docs/templates/custom-directives/)。

这是一个快速参考表，后面的部分是每种表达式类型的更多详细信息。

<table class="wide-table">
<thead>
<tr>
<th class="no-wrap-cell">类型</th>
<th class="wide-cell">示例</th>
</tr>
</thead>
<tbody>
<tr>
<td class="no-wrap-cell">

[Child nodes](#child-expressions)

</td>
<td>

```js
html`
<h1>Hello ${name}</h1>
<ul>
  ${listItems}
</ul>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Attributes](#attribute-expressions)

</td>
<td>

```js
html`<div class=${highlightClass}></div>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Boolean Attributes](#boolean-attribute-expressions)

</td>
<td>

```js
html`<div ?hidden=${!show}></div>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Properties](#property-expressions)

</td>
<td>

```js
html`<input .value=${value}>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Event listeners](#event-listener-expressions)

</td>
<td>

```js
html`<button @click=${this._clickHandler}>Go</button>`
```

</td>
</tr>
<tr>
<td class="no-wrap-cell">

[Element directives](#element-expressions)

</td>
<td>

  ```js
  html`<input ${ref(inputRef)}>`
  ```

</td>
</tr>
</tbody>
</table>

这个基本示例展示了各种不同类型的表达式。

{% playground-example "docs/templates/expressions" "my-element.ts" %}

下面部分更加详细地描述了每种表达式。有关模板结构的更多信息，请参阅 [格式良好的 HTML](#well-formed-html) 和 [有效表达式位置](#expression-locations)。

## 子节点表达式 { #child-expressions }

出现在元素的开始和结束标记之间的表达式可以将子节点添加到元素上。例如：

```js
html`<p>Hello, ${name}</p>`
```

或:

```js
html`<main>${bodyText}</main>`
```

子节点所在位置的表达式可以有多种取值：

* 字符串、数字和布尔值等原始值。
* 使用 `html` 函数创建的 `TemplateResult` 对象。
* DOM 节点。
* 上述受支持类型的数组或可迭代对象。

### 原始值 {#primitive-values}

字符串、数字、布尔值、null 和 undefined 等原始值在插入到文本内容中或属性值内时，会转换为字符串。 它们会被拿去与前一个值比较，如果值没有更改，则不会更新 DOM。

### 模板 {#templates}

因为子节点位置的表达式可以返回 `TemplateResult`，所以你可以嵌套和组合模板：

```js
const nav = html`<nav>...</nav>`;
const page = html`
  ${nav}
  <main>...</main>
`;
```

这意味着你可以使用纯 JavaScript 来创建条件模板、重复模板等。

```js
html`
  ${this.user.isloggedIn
      ? html`Welcome ${this.user.name}`
      : html`Please log in`
  }
`;
```

有关条件式的更多信息，请参阅 [条件式]({{baseurl}}/docs/templates/conditionals/)。

有关使用 JavaScript 创建重复模板的更多信息，请参阅 [Lists](/docs/templates/lists/)。

### DOM 节点 {#dom-nodes}

任何 DOM 节点都可以传给子节点表达式。 通常情况下 DOM 节点应该通过 `html` 指定模板的方式来渲染，但是在必要时也可以像这样直接渲染 DOM 节点。 该节点会被添加到 DOM 树的那个位置，同时也会从任何当前父节点中删除：

```js
const div = document.createElement('div');
const page = html`
  ${div}
  <p>This is some text</p>
`;
```

### 数组和可迭代对象 {#arrays-and-iterables}

表达式还可以以任意组合的形式返回任何受支持类型的数组或可迭代对象。 你可以将此功能与标准 JavaScript（如 Array `map` 方法）一起使用，来创建重复的模板和列表。请参阅 [列表]({{baseurl}}/docs/templates/lists/) 了解有关示例。

## Attribute 表达式 {#attribute-expressions }

除了使用表达式添加子节点之外，还可以使用它们来设置元素的 attribute 和 property。

默认情况下，属性值中的表达式会设置该属性：

```js
html`<div class=${this.textClass}>Stylish text.</div>`;
```

由于 attribute 值始终是字符串，因此表达式应该返回一个可以转换为字符串的值。

如果表达式构成整个属性值，则可以省略引号。 如果表达式仅构成属性值的一部分，则需要引用整个值：

```js
html`<img src="/images/${this.image}">`;
```

### 如果定义了数据，则设置属性 { #ifDefined }

有时你只想在一个值或一组值可用时才设置一个属性，否则删除该属性。 例如，试想一下：

```js
html`<img src="/images/${this.imagePath}/${this.imageFile}">`;
```

如果 `this.imagePath` 或 `this.imageFile` 未定义，则不应设置 `src` 属性，否则会出现无效的网络请求。

可以使用 [ifDefined]({{baseurl}}/docs/api/directives/#ifDefined) 指令来避免此问题：

```js
html`<img src="/images/${ifDefined(this.imagePath)}/${ifDefined(this.imageFile)}">`;
```

在此示例中，要设置的 `src` 属性，则必须同时定义 `this.imagePath` 和 `this.imageFile`。 如果值不是 `null` 或 `undefined`，则认为该值已定义。

## 布尔属性 {#boolean-attribute-expressions }

要设置布尔属性，请使用带有 `?` 前缀的属性名称。 如果表达式计算结果为真值，则添加该属性，如果计算结果为假值，则删除该属性：

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

## Property 表达式 {#property-expressions}

You can set a JavaScript property on an element using the `.` prefix and the property name:
可以在元素上使用 `.` 前缀和 property 名称设置 JavaScript 属性：

```js
html`<input .value=${this.itemCount}>`;
```

可以使用此语法将复杂数据沿树向下传递到子组件。 例如，如果你有一个带有 `listItems` 属性的 `my-list` 组件，则可以向它传递一个对象数组：

```js
html`<my-list .listItems=${this.items}></my-list>`;
```

请注意，此示例中的属性名称 `listItems` 是大小写混合的。 尽管 HTML *attribute* 不区分大小写，但 Lit 在处理模板时会保留属性名称的大小写。

有关组件属性的更多信息，请参阅 [响应式属性](/docs/components/properties/)。

## 事件监听器表达式 {#event-listener-expressions}

模板还可以包含声明式事件监听器。 如果使用前缀 `@` 后跟事件名称定义表达式。 则该表达式应被判定为事件监听器。

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

这相当于在按钮元素上调用 `addEventListener('click', this.clickHandler)`。

事件监听器可以是普通函数，也可以是具有 `handleEvent` 方法的对象 — 与标准 [`addEventListener`](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)方法的 `listener` 参数相同。

在 Lit 组件中，事件监听器会自动绑定到组件，因此你可以使用处理程序内部的 `this` 值来引用组件实例。

```js
clickHandler() {
  this.clickCount++;
}
```

有关组件事件的更多信息，请参阅 [Events]({{baseurl}}/docs/components/events/)。

## 元素表达式 {#element-expressions}

你还可以添加能够访问元素实例的表达式，而不是访问元素上的单个 attribute 或 property：

```js
html`<div ${myDirective()}></div>`
```

元素表达式仅适用于 [指令]({{baseurl}}/docs/templates/directives/)。 元素表达式中的任何其他值类型都将被忽略。

一个可以在元素表达式中使用的内置指令是`ref`指令。 它提供了对渲染元素的引用。

```js
html`<button ${ref(this.myRef)}`;
```

有关详细信息，请参阅 [ref]({{baseurl}}/docs/templates/directives/#ref)。

## 格式良好的 HTML { #well-formed-html }

Lit 模板必须是格式良好的 HTML。 在任何值被插入之前，浏览器的内置 HTML 解析器会解析模板。 对于格式正确的模板，请遵循以下规则：

 * 当所有表达式都被空值替换时，模板必须是格式良好的 HTML。

 * 模板可以有多个顶级元素和文本。

 * 模板 _不应该包含_ 未关闭的元素——它们将被 HTML 解析器关闭。

    ```js
    // HTML 解析器在 “Some text” 之后关闭这个 div
    const template1 = html`<div class="broken-div">Some text`;
    // 拼接时，"more text" 不会的 .broken-div 的结尾
    const template2 = html`${template1} more text. </div>`;
    ```

<div class="alert alert-info">

由于浏览器的内置解析器非常宽松，大多数格式错误的模板在运行时都无法被检测到，因此你不会看到警告——只是模板的行为与你的预期不符。 我们建议在开发过程中使用 <a href="{{baseurl}}/docs/tools/development/#linting">lint 工具</a> 和 <a href="{{baseurl}}/docs/tools/development/#ide-plugins">IDE 插件</a> 查找模板中的问题。

</div>

## 有效的表达式位置 { #expression-locations }

表达式**_只能出现_**在 HTML 中可以放置 attribute 值和子元素的地方。

```html
<!-- attribute values -->
<div label=${label}></div>
<button ?disabled=${isDisabled}>Click me!</button>
<input .value=${currentValue}>
<button @click=${this.handleClick()}>

<!-- child content -->
<div>${textContent}</div>
```

元素表达式可以出现在开标签内的标签名称之后：

```html
<div ${ref(elementReference)}></div>
```

### 无效位置 { #invalid-locations }

表达式通常不应出现在以下位置：

* 出现在标签名或属性名的位置。 Lit 不支持在这些位置动态改变值，在开发模式下会出错。

  ```html
  <!-- ERROR -->
  <${tagName}></${tagName}>

  <!-- ERROR -->
  <div ${attrName}=true></div>
  ```

* 在 `<template>` 元素内容内（允许在 template 元素本身上使用 attribute 表达式）。 Lit 不会递归到模板内容去动态更新表达式，在开发模式下会出错。

  ```html
  <!-- ERROR -->
  <template>${content}</template>

  <!-- OK -->
  <template id="${attrValue}">static content ok</template>
  ```

* 在 `<textarea>` 元素内容内（允许在 textarea 元素本身上使用 attribute 表达式）。 请注意，Lit 可以将内容渲染到 textarea 中，但是编辑 textarea 会破坏对 Lit 用于动态更新的 DOM 的引用，并且 Lit 会在开发模式下发出警告。 相反，应该绑定到 textarea 的 .value 属性。

  ```html
  <!-- BEWARE -->
  <textarea>${content}</textarea>

  <!-- OK -->
  <textarea .value=${content}></textarea>

  <!-- OK -->
  <textarea id="${attrValue}">static content ok</textarea>
  ```

* 同样，在具有 `contenteditable` 属性的元素内部也是如此。 相反，应该绑定到元素的 `.innerText` 属性。

  ```html
  <!-- BEWARE -->
  <div contenteditable>${content}</div>

  <!-- OK -->
  <div contenteditable .innerText=${content}></div>

  <!-- OK -->
  <div contenteditable id="${attrValue}">static content ok</div>
  ```

* 在 HTML 注释内。 Lit 不会更新注释内的表达式，而是使用 Lit token 字符串呈现这些表达式。 但是，这不会破坏后续的表达式，因此在开发过程中注释掉可能包含表达式的 HTML 块是安全的。

  ```html
  <!-- will not update: ${value} -->
  ```

* 使用 ShadyCSS polyfill 时在 `<style>` 元素内。 有关详细信息，请参阅 [表达式和 style 元素]({{baseurl}}/docs/components/styles/#style-element)。

请注意，上述所有无效情况下的表达式在使用 [静态表达式](#static-expressions) 时都是有效的。由于涉及的效率低下的问题，这些用法不应该用于对性能敏感更新的场景（见下文）。
## 静态表达式 { #static-expressions }

静态表达式会返回一些特殊的值，然后在模板被 Lit 处理为 HTML 之前插入到模板中。 因为它们会成为模板的静态 HTML 的一部分，所以它们可以放置在模板中的任何位置——即使是通常不允许使用表达式的地方，例如属性和标签名称。

要使用静态表达式，你必须从 Lit 的 `static-html` 模块导入特殊版本的 `html` 或 `svg` 模板标签：

```ts
import {html, literal} from 'lit/static-html.js';
```

`static-html` 模块包含 `html` 和 `svg` 标签函数，它们支持静态表达式，可以用它们来替代 `lit` 模块中提供的标准版本。 同时，我们需要使用 `literal` 标签函数来创建静态表达式。

你可以将静态表达式用于不太可能更改的配置选项，或用于自定义模板中无法使用普通表达式更改的部分 - 有关详细信息，请参阅 [有效表达式位置](#expression-locations) 部分。 例如，`my-button` 组件可能会渲染 `<button>` 标签，但子类可能会渲染 `<a>` 标签。 这是使用静态表达式的好地方，因为设置不会经常更改，并且无法使用普通表达式自定义 HTML 标记。

{% switchable-sample %}

```ts
import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {html, literal} from 'lit/static-html.js';

@customElement('my-button')
class MyButton extends LitElement {
  tag = literal`button`;
  activeAttribute = literal`active`;
  @property() caption = 'Hello static';
  @property({type: Boolean}) active = false;

  render() {
    return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
  }
}
```

```js
import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';

class MyButton extends LitElement {
  static properties = {
    caption: {},
    active: {type: Boolean},
  };

  tag = literal`button`;
  activeAttribute = literal`active`;

  constructor() {
    super();
    this.caption = 'Hello static';
    this.active = false;
  }

  render() {
    return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
  }
}
customElements.define('my-button', MyButton);
```

{% endswitchable-sample %}

{% switchable-sample %}

```ts
@customElement('my-anchor')
class MyAnchor extends MyButton {
  tag = literal`a`;
}
```

```js
class MyAnchor extends MyButton {
  tag = literal`a`;
}
customElements.define('my-anchor', MyAnchor);
```

{% endswitchable-sample %}

<div class="alert alert-warning">

**更改静态表达式的值代价很大。** 使用 `literal` 值的表达式不应频繁更改，因为它们会导致 Lit 重新解析新模板，并且将每个变体都保存在内存中。

</div>

在上面的示例中，如果模板重新渲染并且 `this.caption` 或 `this.active` 更改，Lit 会高效地更新模板，仅更改受影响的表达式。 但是，如果 `this.tag` 或 `this.activeAttribute` 发生变化，因为它们是用 `literal` 标记的静态值，所以会创建一个全新的模板； 由于 DOM 完全重新渲染，因此更新效率低下。 此外，更改传递给表达式的 `literal` 值会增加内存使用，因为每个模板都会被缓存在内存中以提高重新渲染性能。

由于这些原因，最好将使用 `literal` 的表达式的更改保持在最低限度，并避免使用响应式属性来更改 `literal` 值，因为响应式属性旨在更改。

### 模板结构 {#template-structure}

插入静态值后，模板必须像普通的 Lit 模板一样格式正确，否则模板中的动态表达式可能无法正常工作。 有关详细信息，请参阅 [格式良好的 HTML](#well-formed-html) 部分。

### 非 literal 静态 HTML {#non-literal-statics}

在极少数情况下，你可能需要将不是在脚本中定义的静态 HTML 插入到模板中，因此无法使用 `literal` 函数进行标记。 对于这些情况，可以使用 `unsafeStatic()` 函数并传入来自非脚本源的字符串来创建静态 HTML。

```ts
import {html, unsafeStatic} from 'lit/static-html.js';
```

<div class="alert alert-warning">

**仅适用于受信任的内容。** 请注意使用 `unsafeStatic()` 是 _不安全的_。 传递给 `unsafeStatic()` 的字符串必须由开发人员控制，并且不包含不受信任的内容，因为字符串将被直接解析为 HTML 而不进行清理。 不受信任内容的示例包括：query string 参数和来自用户输入的值。 使用该指令渲染不受信任的内容可能会导致 [跨站脚本攻击 (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) 漏洞。

</div>

{% switchable-sample %}

```ts
@customElement('my-button')
class MyButton extends LitElement {
  @property() caption = 'Hello static';
  @property({type: Boolean}) active = false;

  render() {
    // 这些字符串必须是可信的，否则这是一个 XSS 漏洞
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
  }
}
```

```js
class MyButton extends LitElement {
  static properties = {
    caption: {},
    active: {type: Boolean},
  };

  constructor() {
    super();
    this.caption = 'Hello static';
    this.active = false;
  }

  render() {
    // 这些字符串必须是可信的，否则这是一个 XSS 漏洞
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
  }
}
customElements.define('my-button', MyButton);
```

{% endswitchable-sample %}

请注意，使用 `unsafeStatic` 的行为与 `literal` 有相同的注意事项：因为更改值会导致新模板被解析并缓存在内存中，所以它们不应该被经常更改。
