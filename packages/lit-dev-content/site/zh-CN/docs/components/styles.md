---
title: 样式
eleventyNavigation:
  key: 样式
  parent: 组件
  order: 4
versionLinks:
  v1: components/styles/
---

组件的模板会被渲染到shadow root上，为组件添加的样式的影响范围将自动被限制在shadow root作用域内，只会影响shadow root内部的元素。

Shadow DOM 提供了很强的样式封装能力。如果Lit没有使用Shadow DOM的话，那么你就要非常小心避免组件内的样式污染到组件外的元素，以及组件的祖先或孩子元素。这可能会导致我们写出非常冗长的类名。Lit通过使用Shadow DOM，确保无论怎么写样式选择器，都只会作用于Lit组件的shadow root内部的元素。

## 为组件添加样式 {#add-styles}

将模版字符串传给标签函数`css`，并将其然回值赋值给静态类字段`styles`来定义作用域样式。以这种方式定义样式可实现最佳性能：

{% playground-example "docs/components/style/basic" "my-element.ts" %}

添加到组件的样式通过shadow DOM来实现作用域。查看[Shadow DOM](#shadow-dom)快速了解概览。

静态类字段`styles`的值可以是：

*   单个标签模板字符串。

    ```js
    static styles = css`...`;
    ```

*   标签模板字符串数组

    ```js
    static styles = [ css`...`, css`...`];
    ```

使用静态类字段`styles`几乎是定义组件样式最好的方式，但是这可能无法覆盖某些场景，比如：需要为每个组件实例定义定制化样式。查看[在模板中定义作用域样式]了解其他定义样式的方式。

### 在静态样式中使用表达式 {#expressions}

静态样式对所有实例生效。CSS中的任何表达式只会被计算**一次**，然后被所有实例复用。

为了实现基于树的样式定制化或者给每个类实现样式定制化，可以使用CSS自定义属性来允许元素被[主题化](#theming)。

为了防止Lit组件执行潜在的恶意代码，`css`标记只允许嵌套表达式本身是`css`标记的字符串或数字。

```js
const mainColor = css`red`;
...
static styles = css`
  div { color: ${mainColor} }
`;
```

限制的存在是为了保护应用程序免受安全漏洞的影响，避免从URL参数或数据库等不受信任的来源注入恶意样式甚至恶意代码。

如果非要在`css`字符串中使用一个非`css`字符串的表达式，**并且**你相信这个表达式出自完全受信任的来源，例如表达式是你自己代码中定义的常量，那么你就可以用`unsafeCSS`函数去打包这个表达式并使用它：

```js
const mainColor = 'red';
...
static styles = css`
  div { color: ${unsafeCSS(mainColor)} }
`;
```

<div class="alert alert-info">

**只对受信任的输入使用`unsafeCSS`函数。** 注入未经处理的CSS存在一定的安全风险。例如，恶意CSS可以通过添加指向第三方服务器的图像URL来盗取敏感数据。

</div>

### 从父类继承样式

组件可以使用标签模板字符串数组来实现继承其父类的样式，并向数组中添加自己的样式：

{% playground-ide "docs/components/style/superstyles" %}

在Javascript中，你也可以使用`super.styles`来引用父类的样式属性。如果你在使用Typescript，我们不建议你使用`super.styles`，因为编译器并不总是正确转换它。像示例那样，显示地引用父类可以避免这个问题。

当使用Typescript在编写一个预期可以被子类化的组件时，应当明确地指定`static styles`字段的类型为`CSSResultGroup`，从而允许用户灵活地用数组覆盖`styles`。

```ts
// 防止Typescript将`styles`的类型缩小为`CSSResult`
// 以便子类可以赋值，如：`[SuperElement.styles, css`...`]`;
static styles: CSSResultGroup = css`...`;
```

### 共享样式

You can share styles between components by creating a module that exports tagged styles:

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

Your element can then import the styles and add them to its static `styles` class field:

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

### Using unicode escapes in styles

CSS's unicode escape sequence is a backslash followed by four or six hex digits: for example, `\2022` for a bullet character. This similar to the format of JavaScript's deprecated _octal_ escape sequences, so using these sequences in a `css` tagged template literal causes an error.

There are two work-arounds for adding a unicode escape to your styles:

*   Add a second backslash (for example, `\\2022`).
*   Use the JavaScript escape sequence, starting with `\u` (for example, `\u2022`).

```js
static styles = css`
  div::before {
    content: '\u2022';
  }
```

## Shadow DOM styling overview {#shadow-dom}

This section gives a brief overview of shadow DOM styling.

Styles you add to a component can affect:

* [The shadow tree](#shadowroot) (your component's rendered template).
* [The component itself](#host).
* [The component's children](#slotted).


### Styling the shadow tree {#shadowroot}

Lit templates are rendered into a shadow tree by default. Styles scoped to an element's shadow tree don't affect the main document or other shadow trees. Similarly, with the exception of [inherited CSS properties](#inheritance), document-level styles don't affect the contents of a shadow tree.

When you use standard CSS selectors, they only match elements in your component's shadow tree. This means you can often use very simple selectors since you don't have to worry about them accidentally styling other parts of the page; for example: `input`, `*`, or `#my-element`.

### Styling the component itself {#host}

You can style the component itself using special `:host` selectors. (The element that owns, or "hosts" a shadow tree is called the _host element_.)

To create default styles for the host element, use the `:host` CSS pseudo-class and `:host()` CSS pseudo-class function.

*   `:host` selects the host element.
*   <code>:host(<var>selector</var>)</code> selects the host element, but only if the host element matches _selector_.

{% playground-example "docs/components/style/host" "my-element.ts" %}

Note that the host element can be affected by styles from outside the shadow tree, as well, so you should consider the styles you set in `:host` and `:host()` rules as _default styles_ that can be overridden by the user. For example:

```css
my-element {
  display: inline-block;
}
```

### Styling the component's children {#slotted}

Your component may accept children (like a `<ul>` element can have `<li>` children). To render children, your template needs to include one or more `<slot>` elements, as described in [Render children with the slot element](/docs/components/shadow-dom/#slots).

The `<slot>` element acts as a placeholder in a shadow tree where the host element's children are displayed.

Use the `::slotted()` CSS pseudo-element to select children that are included in your template via `<slot>`s.

*   `::slotted(*)` matches all slotted elements.
*   `::slotted(p)` matches slotted paragraphs.
*   `p ::slotted(*)` matches slotted elements where the `<slot>` is a descendant of a paragraph element.

{% playground-example "docs/components/style/slottedselector" "my-element.ts" %}

Note that **only direct slotted children** can be styled with `::slotted()`.

```html
<my-element>
  <div>Stylable with ::slotted()</div>
</my-element>

<my-element>
  <div><p>Not stylable with ::slotted()</p></div>
</my-element>
```

Also, children can be styled from outside the shadow tree, so you should regard your `::slotted()` styles as default styles that can be overridden.

```css
my-element > div {
  /* Outside style targetting a slotted child can override ::slotted() styles */
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around slotted content.** See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details on how to use the `::slotted()` syntax in a polyfill-friendly way.

</div>

## Defining scoped styles in the template {#styles-in-the-template}

We recommend using the [static `styles` class field](#add-styles) for optimal performance.  However, sometimes you may want to define styles in the Lit template. There are two ways to add scoped styles in the template:

*   Add styles using a [`<style>` element](#style-element).
*   Add styles using an [external style sheet](#external-stylesheet) (not recommended).

Each of these techniques has its own set of advantages and drawbacks.

### In a style element {#style-element}

Typically, styles are placed in the [static `styles` class field](#add-styles); however, the element's static `styles` are evaluated **once per class**. Sometimes, you might need to customize styles **per instance**. For this, we recommend using CSS properties to create [themable elements](#theming). Alternatively, you can also include `<style>` elements in a Lit template. These are updated per instance.

```js
render() {
  return html`
    <style>
      /* updated per instance */
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around per instance styling.** Per instance styling is not supported using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for details.

</div>

#### Expressions and style elements

Using expressions inside style elements has some important limitations and performance issues.

```js
render() {
  return html`
    <style>
      :host {
        /* Warning: this approach has limitations & performance issues! */
        color: ${myColor}
      }
    </style>
    <div>template content</div>
  `;
}
```

<div class="alert alert-info">

**Limitations in the ShadyCSS polyfill around expressions.** Expressions in `<style>` elements won't update per instance in ShadyCSS, due to limitations of the ShadyCSS polyfill. In addition, `<style>` nodes may not be passed as expression values when using the ShadyCSS polyfill. See the [ShadyCSS limitations](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) for more information.

</div>

Evaluating an expression inside a `<style>` element is extremely inefficient. When any text inside a `<style>` element changes, the browser must re-parse the whole `<style>` element, resulting in unnecessary work.

To mitigate this cost, separate styles that require per-instance evaluation from those that don't.

```js
  static styles = css`/* ... */`;
  render() {
    const redStyle = html`<style> :host { color: red; } </style>`;
    return html`${this.red ? redStyle : ''}`

```

### Import an external stylesheet (not recommended) {#external-stylesheet}

While you can include an external style sheet in your template with a `<link>`, we do not recommend this approach. Instead, styles should be placed in the [static `styles` class field](#add-styles).

<div class="alert alert-info">

**External stylesheet caveats.**

*  The [ShadyCSS polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/shadycss#limitations) doesn't support external style sheets.
*   External styles can cause a flash-of-unstyled-content (FOUC) while they load.
*   The URL in the `href` attribute is relative to the **main document**. This is okay if you're building an app and your asset URLs are well-known, but avoid using external style sheets when building a reusable element.

</div>

## Dynamic classes and styles

One way to make styles dynamic is to add expressions to the `class` or `style` attributes in your template.

Lit offers two directives, `classMap` and `styleMap`, to conveniently apply classes and styles in HTML templates.

For more information on these and other directives, see the documentation on [built-in directives](/docs/templates/directives/).

To use `styleMap` and/or `classMap`:

1.  Import `classMap` and/or `styleMap`:

    ```js
    import { classMap } from 'lit/directives/class-map.js';
    import { styleMap } from 'lit/directives/style-map.js';
    ```

2.  Use `classMap` and/or `styleMap` in your element template:

{% playground-example "docs/components/style/maps" "my-element.ts" %}

See [classMap](/docs/templates/directives/#classmap) and [styleMap](/docs/templates/directives/#stylemap) for more information.

## Theming {#theming}

By using [CSS inheritance](#inheritance) and [CSS variables and custom properties](#customprops) together, it's easy to create themable elements. By applying css selectors to customize CSS custom properties, tree-based and per-instance theming is straightforward to apply. Here's an example:

{% playground-example "docs/components/style/theming" "my-element.ts" %}

### CSS inheritance {#inheritance}

CSS inheritance lets parent and host elements propagate certain CSS properties to their descendants.

Not all CSS properties inherit. Inherited CSS properties include:

* `color`
* `font-family` and other `font-*` properties
* All CSS custom properties (`--*`)

See [CSS Inheritance on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance) for more information.

You can use CSS inheritance to set styles on an ancestor element that are inherited by its descendants:

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

### CSS custom properties {#customprops}

All CSS custom properties (<code>--<var>custom-property-name</var></code>) inherit. You can use this to make your component's styles configurable from outside.

The following component sets its background color to a CSS variable. The CSS variable uses the value of `--my-background` if it's been set by a selector matching an ancestor in the DOM tree, and otherwise defaults to `yellow`:

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

Users of this component can set the value of `--my-background`, using the `my-element` tag as a CSS selector:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
</style>
<my-element></my-element>
```

`--my-background` is configurable per instance of `my-element`:

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

See [CSS Custom Properties on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) for more information.
