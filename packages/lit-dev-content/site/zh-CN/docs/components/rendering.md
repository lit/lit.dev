---
title: 渲染
eleventyNavigation:
  key: 渲染
  parent: 组件
  order: 2
versionLinks:
  v1: components/templates/
---

在组件里添加一个模板来定义组件应该怎样呈现，模板也可以包含*表达式*，表达式将作为动态内容呈现。

给组件添加一个 `render()` 方法，然后就可以给组件添加模板了：

{% playground-example "docs/templates/define" "my-element.ts" %}

以 HTML 的形式把你的模板写入 Javascript 的[模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Template_literals)中，并将其传递给 Lit 的 `html` 标签函数。

Lit 的模板可以包含 Javascript 表达式。你可以使用表达式去设置内容，属性（ attribute 和 property ）和事件监听器。`render()` 方法也可以包含任何 Javascript 代码，例如：你可以创建局部变量给表达式使用。

通常，组件的 `render()` 方法返回单个 `TemplateResult` 对象（与 `html` 标签函数返回的类型相同）。但是，它可以返回其他任何 Lit 可以渲染的内容：

*   字符串，数字，布尔等原始值。
*   `html` 函数创建的 `TemplateResult` 对象
*   DOM 节点.
*   包含上述类型的数组或者可迭代对象。

请参阅[模板]({{baseurl}}/docs/templates/overview/)了解更多编写模板的信息。

## 写好 render() 函数

为了充分利用 Lit 的函数式渲染模型， `render()` 方法应遵循以下原则：

* 避免改变组件的状态。
* 避免产生任何副作用。
* 仅使用组件的属性作为输入。
* 当给定相同的属性值时返回相同的结果。

遵循上述原则可以保持模板的确定性，并更容易推导代码。

在大多数情况下，你应该尽量避免在 `render()` 函数之外进行 DOM 更新。相反，应该将组件的模板表示为其状态的函数，通过修改属性改变其状态。

例如：如果组件需要在收到事件时更新 UI，那么，请在事件监听器中更新 `render()` 函数使用到的响应式属性，而不是直接操作 DOM。

有关详细信息，请参阅 [响应式属性]({{baseurl}}/docs/components/properties/)。

## 编写模板

你可以使用其他模板来编写 Lit 模板。下面是一个叫做 `<my-page>` 的组件的例子，它的模板是由 header，footer，和主体内容构成。

{% playground-example "docs/templates/compose" "my-page.ts" %}

在这个示例中，各个模板被定义为实例的方法，因此子类可以继承这个组件并覆盖一个或多个模板的方法。

{% todo %}

Move example to composition section, add xref.

{% endtodo %}

你也可以导入别的元素，然后将其组合到你的模板中。

{% playground-ide "docs/templates/composeimports" %}


## 模板什么时候渲染

当一个Lit组件被添加到页面上的 DOM 时，就会进行初始渲染模板。初始渲染之后，组件的响应式属性的任何更改都会触发更新周期，重新渲染组件。

Lit 引入批量更新机制最大程度提高性能和效率。一次性设置多个属性只会触发一次更新，更新操作被放在微任务中异步执行。

在更新期间，仅重新渲染 DOM 中更改的部分。 虽然 Lit 模板看起来像字符串插值，但 Lit 只会解析并创建一次静态 HTML，后续渲染只更新表达式中被更改的值，这使得更新非常高效。

请参阅[属性更新时发生了什么]({{baseurl}}/docs/components/properties/#when-properties-change)了解更多关于更新周期的信息。

## DOM 封装

Lit 使用 shadow DOM 来封装组件渲染的DOM。Shadow DOM允许元素创建自己的、独立于主文档树的 DOM 树。它是 Web 组件规范的核心特性，是实现互操作性、样式封装和其他特性的基础。

请参阅[Shadow DOM v1: 自包含Web组件](https://developers.google.com/web/fundamentals/web-components/shadowdom)了解更多有关 shadow DOM 的信息。

请参阅[使用 Shadow DOM]({{baseurl}}/docs/components/shadow-dom/)了解更多关于如何在组件中使用 shadow DOM。

## 更多资料

* [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/)
* [模板预览]({{baseurl}}/docs/templates/overview/)
* [模板表达式]({{baseurl}}/docs/templates/expressions/)


