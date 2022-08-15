---
title: 本地化最佳实践
eleventyNavigation:
  key: 最佳实践
  parent: 本地化
  order: 5
---


## 确保在 render 中重新计算 {#ensure-re-evaluation-on-render}

每次调用 `msg` 函数时，它都会返回活动语言环境中给定字符串或 Lit 模板的版本。 然而，这个结果只是一个普通的字符串或模板； 当语言环境发生变化时，它*本质上*是不能重新渲染自己的。

出于这个原因，编写 `msg` 调用的方式很重要，请确保每次运行 Lit 的 `render` 方法时都会重新计算它们。 这样，当语言环境更改时，将返回最新语言环境的正确字符串或模板。

一种很容易出错的情况是给本地化属性赋默认值时。 这样写似乎很正常：

```js
// 不要这样做！
label = msg('Default label')

render() {
  return html`<button>${this.label}</button>`;
}
```

但是，上述模式无法在语言环境更改时更新默认标签。 默认值将停留在实例化元素时碰巧处于活动状态的语言环境中的版本。

一个简单的解决方法就是将用于回退的默认值直接移动到渲染方法中：

```js
render() {
  return html`<button>${this.label ?? msg('Default label')}</button>`;
}
```

或者，可以使用自定义 getter/setter 来创建更自然的写法：

{% switchable-sample %}

```ts
private _label?: string;

@property()
get label() {
  return this._label ?? msg('Default label');
}

set label(label: string) {
  this._label = label;
}

render() {
  return html`<button>${this.label}</button>`;
}
```

```js
static properties = {
  label: {}
};

get label() {
  return this._label ?? msg('Default label');
}

set label(label) {
  this._label = label;
}

render() {
  return html`<button>${this.label}</button>`;
}
```

{% endswitchable-sample %}

## 避免不必要的 HTML 标记 {#avoid-unnecessary-html-markup}

虽然 `@lit/localize` 完全支持在本地化模板中嵌入 HTML 标记，但最好尽可能避免这样做。 因为：

1. 对于翻译者来说，处理简单的字符串短语比处理嵌入标记的短语更容易。

2. 避免标记改变时不必要的重新翻译工作，例如在不改变含义的情况下添加影响外观的类。

3. 切换语言环境通常会更快，因为需要更新的 DOM 部分更少。 此外，bundle 中也会包含更少的 JavaScript，因为不需要将通用标记复制到每个翻译中。


不理想：
```js
render() {
  // 不要这样做！ 没有理由在这个本地化模板中包含 <button> 标记。
  return msg(html`<button>Launch rocket</button>`);
}
```

理想：
```js
render() {
  // 好多了！ 现在“Launch rocket”这个短语可以更容易地单独翻译。
  return html`<button>${msg('Launch rocket')}</button>`;
}
```

将模板分解成更小的部分（对翻译）也很有帮助：

```js
render() {
  // 不要这样做！
  return msg(html`
  <p>The red button makes the rocket go up.</p>
  <p>The green button makes the rocket do a flip.</p>
  `);
}
```

```js
render() {
  // 更好的！ 无需翻译人员处理任何标记，每个句子都可以独立翻译。
  return html`
  <p>${msg('The red button makes the rocket go up.')}</p>
  <p>${msg('The green button makes the rocket do a flip.')}</p>
  `;
}
```

<div class="alert alert-info">

使用转换模式时，模板将自动展平，使它们尽可能小且高效。 转换后，上面的这个例子不会再有任何占位符，因为它知道字符串可以直接合并到 HTML 模板中。

</div>

在某些场景中，HTML *应该*包含在本地化模板中。 例如，在短语中间需要一个 HTML 标记：
```js
render() {
  return msg(html`Lift off in <b>T-${this.countdown}</b> seconds`);
}
```

## 安全地重新导出或重写本地化 API {#safely-re-exporting-or-re-assigning-localize-apis}

静态分析用于确定你何时调用 `@lit/localize` `msg` 函数和其他 API，而不是同名的不同函数。

可以重新导出或重写 `msg` 函数和其他 API，并且大多数情况下这也能正常工作。

但是，某些模式可能过于动态，静态分析无法理解。 如果提取 message 失败，并且你已经重写或重新导出了 `msg` 功能，那么这可能就是失败的原因。

想要强制将函数作为 `@lit/localize` API 进行分析，可以在 JavaScript 中使用 JSDoc `@type` 注释，或在 TypeScript 中使用类型转换：

{% switchable-sample %}

```ts
const myMsg = ... as typeof import('@lit/localize').msg;
```

```js
/** @type import('@lit/localize').msg */
const myMsg = ...;
```

{% endswitchable-sample %}
