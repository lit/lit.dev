---
title: 模板概览
eleventyNavigation:
  key: 概览
  parent: Templates
  order: 1
versionLinks:
  v1: components/templates/
---

{% todo %}

If time permits, add new page on working with inputs, per outline.

{% endtodo %}

Lit 模板是用 Javascript 标签模板字符串 - `html` 标签来编写的，字符串是一些非常简单，声明式的内容，HTML:

```js
html`<h1>Hello ${name}</h1>`
```

模板语法可能看起来只是在进行字符串插值。但是对于标签模板字符串，浏览器向标签函数传递一个字符串数组（模板的静态部分）和一个表达式数组（动态部分）。 Lit 使用它来构建模板的有效表示，因此可以仅重新渲染模板中已更改的部分。

Lit 模板极具表现力，允许你以多种方式呈现动态内容：

 - [表达式]({{baseurl}}/docs/templates/expressions/): 模板可以包含 *表达式* 动态值，可用于渲染属性、文本、属性、事件处理程序，甚至其他模板。
 - [条件式]({{baseurl}}/docs/templates/conditionals/): 表达式可以使用标准 JavaScript 流程控制根据条件渲染内容。
 - [Lists]({{baseurl}}/docs/templates/lists/): 通过使用标准 JavaScript 循环和数组技术将数据转换为模板数组来渲染列表。
 - [内置指令]({{baseurl}}/docs/templates/directives/): 指令是可以扩展 Lit 模板功能的函数。Lit 包含一组内置指令，可帮助满足各种渲染需求。
 - [自定义指令]({{baseurl}}/docs/templates/custom-directives/): 你还可以编写自己的指令来根据需要自定义 Lit 的渲染。

## 独立模板

您还可以在 Lit 组件之外使用 Lit 的模板库定义独立模板。有关详细信息，请参阅 [独立的 lit-html 模板]({{baseurl}}/docs/libraries/standalone-templates)。
