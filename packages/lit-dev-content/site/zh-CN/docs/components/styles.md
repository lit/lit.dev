---
title: 样式
eleventyNavigation:
  key: 样式
  parent: 组件
  order: 4
versionLinks:
  v1: components/styles/
---

组件的模板会被渲染到 shadow root 上，为组件添加的样式的影响范围将自动被限制在 shadow root 作用域内，只会影响 shadow root 内部的元素。

Shadow DOM 提供了很强的样式封装能力。如果 Lit 没有使用 Shadow DOM 的话，那么你就要非常小心避免组件内的样式污染到组件外的元素，以及组件的祖先或孩子元素。这可能会导致我们写出非常冗长的类名。Lit 通过使用 Shadow DOM，确保无论怎么写样式选择器，都只会作用于 Lit 组件的 shadow root 内部的元素。

## 为组件添加样式 {#add-styles}

将模板字符串传给标签函数 `css`，并将其返回值赋值给静态类字段 `styles` 来定义作用域样式。以这种方式定义样式可实现最佳性能：

{% playground-example "docs/components/style/basic" "my-element.ts" %}

添加到组件的样式通过 shadow DOM 来实现作用域。请参阅 [Shadow DOM](#shadow-dom) 快速了解概览。

静态类字段 `styles` 的值可以是：

*   单个标签模板字符串。

    ```js
    static styles = css`...`;
    ```

*   标签模板字符串数组

    ```js
    static styles = [ css`...`, css`...`];
    ```

使用静态类字段 `styles` 几乎是定义组件样式最好的方式，但是这可能无法覆盖某些场景，比如：需要为每个组件实例定义定制化样式。请参阅[在模板中定义作用域样式]了解其他定义样式的方式。

### 在静态样式中使用表达式 {#expressions}

静态样式对所有实例生效。CSS 中的任何表达式只会被计算**一次**，然后被所有实例复用。

为了实现基于树的样式定制化或者给每个类实现样式定制化，可以使用 CSS 自定义属性来允许元素被[主题化](#theming)。

为了防止 Lit 组件执行潜在的恶意代码，`css` 标记只允许嵌套表达式本身是 `css` 标记的字符串或数字。

```js
const mainColor = css`red`;
...
static styles = css`
  div { color: ${mainColor} }
`;
```

限制的存在是为了保护应用程序免受安全漏洞的影响，避免从 UR L参数或数据库等不受信任的来源注入恶意样式甚至恶意代码。

如果非要在 `css` 字符串中使用一个非 `css` 字符串的表达式，**并且**你相信这个表达式出自完全受信任的来源，例如表达式是你自己代码中定义的常量，那么你就可以用 `unsafeCSS` 函数去打包这个表达式并使用它：

```js
const mainColor = 'red';
...
static styles = css`
  div { color: ${unsafeCSS(mainColor)} }
`;
```

<div class="alert alert-info">

**只对受信任的输入使用 `unsafeCSS` 函数。** 注入未经处理的 CSS 存在一定的安全风险。例如，恶意 CSS 可以通过添加指向第三方服务器的图像 URL 来盗取敏感数据。

</div>

### 从父类继承样式

组件可以使用标签模板字符串数组来实现继承其父类的样式，并向数组中添加自己的样式：

{% playground-ide "docs/components/style/superstyles" %}

在 Javascript 中，你也可以使用 `super.styles` 来引用父类的样式属性。如果你在使用 Typescript，我们不建议你使用 `super.styles`，因为编译器并不总是正确转换它。像示例那样，显示地引用父类可以避免这个问题。

当使用 Typescript 在编写一个预期可以被子类化的组件时，应当明确地指定 `static styles` 字段的类型为 `CSSResultGroup`，从而允许用户灵活地用数组覆盖 `styles`。

```ts
// 防止 Typescript 将`styles`的类型缩小为 `CSSResult`
// 以便子类可以赋值，如：`[SuperElement.styles, css`...`]`;
static styles: CSSResultGroup = css`...`;
```

### 共享样式

通过创建一个模块，并导出标签模板字符串样式的方式，在组件之间共享样式：

```js
export const buttonStyles = css`
  .blue-button {
    color: white;
    background-color: blue;
  }
  .blue-button:disabled {
    background-color: grey;
  }`;
```

组件可以导入样式，然后添加到自己的静态类字段`styles`中：

```js
import { buttonStyles } from './button-styles.js';

class MyElement extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host { display: block;
        border: 1px solid black;
      }`
  ];
}
```

### 在样式中使用 unicode 转义字符

CSS中的unicode转义字符序列是由一个反斜杠加上四个或六个十进制数组成，例如：`\2022`表示一个黑圆点。这有点像Javascript中已经弃用的*octal*转义字符序列，因此直接在`css`标签模板字符串中使用这些转义字符就会报错。

下面是两种在组件的样式中使用unicode转义字符的变通方法：

*   使用两个反斜杠（如：`\\2022`）。
*   使用Javascript以`\u`开头的转义字符（如：`\u2022`）。

```js
static styles = css`
  div::before {
    content: '\u2022';
  }
```

## Shadow DOM 样式概览{#shadow-dom}

这部分将简短地阐述一下 shadow DOM 样式。

组件的样式将会作用于：

* [shadow 树](#shadowroot) (组件的渲染模板)
* [组件自身](#host)
* [组件的子元素](#slotted)

### 为 shadow 树设置样式 {#shadowroot}

Lit 组件的模板默认被渲染成一个 shadow 树。元素的 shadow 树的作用域样式不会影响到主文档或者其他 shadow 树。同样，除了[继承CSS属性](#inheritance) 之外，文档级样式也不会影响 shadow 树的内容。

标准 CSS 选择器只能匹配组件 shadow 树内部的元素。这意味着你可以使用非常简单的选择器，而不必担心它们会意外地为页面的其他部分设置样式，例如：`input`、`*` 或 `#my-element`。

### 为组件自身设置样式 {#host}

可以使用特殊的 `:host` 选择器来为组件自身设置样式。（拥有或“寄宿着”一个 shadow 树的元素被叫做 _宿主元素_）。

使用 `:host` 伪类和 `:host()` CSS伪类函数来给宿主元素设置默认样式。

*   `:host` 选中宿主元素。
*   <code>:host(<var>selector</var>)</code> 仅当宿主元素和 _selector_ 匹配的时候才会选中宿主元素。

{% playground-example "docs/components/style/host" "my-element.ts" %}


请注意，宿主元素也可能受到shadow树外部样式的影响，因此你应该将在 `:host` 和 `:host()` 规则中设置的样式视为可以被用户覆盖的 _默认样式_。例如：

```css
my-element {
  display: inline-block;
}
```

### 为组件的子元素设置样式 {#slotted}

组件可以包含子元素（就像 `<ul>` 元素可以包含 `<li>` 子元素）。如果需要渲染子元素，那么你的模板就需要包含一个或多个 `<slot>` 元素，请参阅 [使用 slot 元素渲染子元素]({{baseurl}}/docs/components/shadow-dom/#slots) 了解详情。

`<slot>` 元素在 shadow 树中扮演一个占位符的角色，宿主元素的子元素将显示在占位符所在的位置。

使用 `::slotted()` CSS 伪元素选择器选择被 `<slot>` 包含在组件模板中的子元素。

*   `::slotted(*)` 匹配插槽中的所有元素.
*   `::slotted(p)` 匹配插槽中的p元素.
*   `p ::slotted(*)` 匹配 p 元素的后代元素的插槽中的元素。

{% playground-example "docs/components/style/slottedselector" "my-element.ts" %}

请注意，**只有直接插槽子元素**才可以被 `::slotted()` 设置样式。

```html
<my-element>
  <div>可以被 ::slotted() 设置样式</div>
</my-element>

<my-element>
  <div><p>不可以被 ::slotted() 设置样式</p></div>
</my-element>
```

此外，可以从 shadow 树外部设置子元素样式，因此你应该将 `::slotted()` 样式视为可以被覆盖的默认样式。

```css
my-element > div {
  /* 为插槽子元素设置的外部样式可以覆盖 ::slotted() 样式*/
}
```

<div class="alert alert-info">

**插槽内容上的 ShadyCSS polyfill 的限制**，请参阅 [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) 了解如何通过 polyfill 友好的方式来使用 `::slotted()` 语法。

</div>

## 在模板中定义作用域样式 {#styles-in-the-template}

我们建议使用 [静态类字段 `styles`](#add-styles) 定义样式以获得最佳性能。但是，有时你可能希望在 Lit 模板中定义样式。在模板中添加作用域样式有两种方法：

*   使用[`<style>` 元素](#style-element)添加样式。
*   使用[外部样式表](#external-stylesheet)添加样式 (不推荐)。

这些技术中的每一种都有其自身的优点和缺点。

### 在 style 元素中设置 {#style-element}

通常情况下，样式应该放置在 [静态类字段](#add-styles) 中；但是，每个组件类的静态 `styles` 只会被计算**一次**。可能在某种场景下你需要为**每个实例**自定义样式。针对这种情况，我们建议使用 CSS 属性来创建 [主题化元素](#theming)。或者，你也可以在 Lit 模板中包含 `<style>` 元素。`<style>`元素样式也是按实例更新的。

```js
render() {
  return html`
    <style>
      /* 按实例更新 */
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**ShadyCSS polyfill 对每个实例样式的限制。** ShadyCSS polyfill 不支持为每个实例设置样式。请参阅[ShadyCSS 限制](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations)了解更多信息。

</div>

#### 表达式和 style 元素

在 style 元素内使用表达式会有一些限制和性能问题。

```js
render() {
  return html`
    <style>
      :host {
        /* 注意: 这种用法会有一些限制和性能问题 */
        color: ${myColor}
      }
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**ShadyCSS polyfill 对表达式的限制。** 由于 ShadyCSS polyfill 的限制，`<style>` 元素中的表达式不会在 ShadyCSS 中按实例更新。此外，在使用 ShadyCSS polyfill 时，`<style>` 节点可能不会作为表达式值传递。有关详细信息，请参阅[ShadyCSS 限制](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations)了解更多信息。

</div>

在 `<style>` 元素中计算表达式是非常低效的。因为当 `<style>` 元素中的任何文本发生变化时，浏览器必须重新解析整个 `<style>` 元素，从而导致执行不必要的工作。

为了降低性能开销，应该把需要为每个实例单独计算的样式和不需要单独计算的样式独立开来。

```js
  static styles = css`/* ... */`;
  render() {
    const redStyle = html`<style> :host { color: red; } </style>`;
    return html`${this.red ? redStyle : ''}`

```

### 导入外部样式表 {#external-stylesheet}

虽然你可以在模板中使用 `<link>` 引入一个外部样式表，但我们不推荐这种用法。 相反，样式应该被放在 [静态类字段 `styles`](#add-styles) 中。  

<div class="alert alert-info">

**关于外部样式表的说明：**

*   [ShadyCSS polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) 不支持外部样式表。
*   当在加载外部样式表的时候，会造成文档样式短暂失效（FOUC）。
*   `href` 属性中的 URL 是相对于**主文档**的。 如果你正在构建一个应用，并且你的资产 url 是众所周知的，这种情况下你可以使用外部样式表。但如果你是在构建可重用元素的话，应避免使用外部样式表。  

</div>

## 动态类和样式

使样式动态化的一种方法是将表达式添加到模板中的 `class` 或 `style` 属性。

Lit 提供了两个指令，`classMap` 和 `styleMap`，可以方便地在 HTML 模板中应用类和样式。

请参阅文档[内置指令]({{baseurl}}/docs/templates/directives/)了解更多关于这两个指令或者更多指令的信息。

使用 `styleMap` 和/或 `classMap`：

1.  导入 `classMap` 和/或 `styleMap`:

    ```js
    import { classMap } from 'lit/directives/class-map.js';
    import { styleMap } from 'lit/directives/style-map.js';
    ```

2.  在模板中使用 `classMap` 和/或 `styleMap`:

{% playground-example "docs/components/style/maps" "my-element.ts" %}

请参[classMap]({{baseurl}}/docs/templates/directives/#classmap) 和 [styleMap]({{baseurl}}/docs/templates/directives/#stylemap)了解更多信息。

## 主题化 {#theming}

通过同时使用 [CSS 继承](#inheritance) 和 [CSS 变量和自定义属性](#customprops)，可以轻松创建可主题化的元素。通过应用 CSS 选择器来定制 CSS 自定义属性，可以直接基于树和实例去应用主题。下面是一个例子：

{% playground-example "docs/components/style/theming" "my-element.ts" %}

### CSS 继承 {#inheritance}

CSS 继承允许父元素和宿主元素将某些 CSS 属性传播给它们的后代。

并非所有 CSS 属性都是可继承的。可继承的 CSS 属性包括：

* `color`
* `font-family` 和其他 `font-*` 属性
* 所有的自定义 CSS 属性 (`--*`)

请参阅[MDN 上的 CSS 继承](https://developer.mozilla.org/zh-CN/docs/Web/CSS/inheritance)了解更多信息。

你可以利用 CSS 继承机制，在祖先元素设置样式，让其后代元素来继承。

```html
<style>
html {
  color: green;
}
</style>
<my-element>
  #shadow-root
    Will be green
</my-element>
```

### CSS 自定义属性 {#customprops}

所有 CSS 自定义属性 (<code>--<var>custom-property-name</var></code>) 都是可继承的。你可以使用该特性使你的组件样式可以从外部进行配置。

下面的组件将其背景颜色设置为 CSS 变量。如果 CSS 变量由匹配 DOM 树中的祖先的选择器设置，则 CSS 变量使用 `--my-background` 的值，否则默认为 `yellow`：

```js
class MyElement extends LitElement {
  static styles = css`
    :host {
      background-color: var(--my-background, yellow);
    }
  `;
  render() {
    return html`<p>Hello world</p>`;
  }
}
```

该组件的调用者，可以通过 CSS 标签选择器 `my-element` 设置 `--my-background` 的值：

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
</style>
<my-element></my-element>
```

`--my-background` 对于每个 `my-element` 实例都是可配置的:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
  my-element.stuff {
    --my-background: #111111;
  }
</style>
<my-element></my-element>
<my-element class="stuff"></my-element>
```

请参阅 [MDN 上的自定义 CSS 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)了解更多信息。
