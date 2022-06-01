---
title: 条件式
eleventyNavigation:
  key: 条件式
  parent: 模板
  order: 3
versionLinks:
  v1: components/templates/#use-properties-loops-and-conditionals-in-a-template
---

由于 Lit 支持普通的 Javascript 表达式，因此你可以使用标准的 Javascript 控制流结构，例如 [条件运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)、函数调用, 以及 `if` 或 `switch` 语句来渲染条件内容。

JavaScript 条件式还允许你组合嵌套的模板表达式，你甚至可以将模板结果存储在变量中然后在其他地方使用。

## 带有条件（三元）运算符的条件式

带有条件运算符 `?` 的三元表达式是添加内联条件的好方法：

```ts
render() {
  return this.userName
    ? html`Welcome ${this.userName}`
    : html`Please log in <button>Login</button>`;
}
```

## 带有 if 语句的条件式

你可以使用模板外部的 if 语句来表达条件逻辑来计算要在模板内部使用的值：

```ts
render() {
  let message;
  if (this.userName) {
    message = html`Welcome ${this.userName}`;
  } else {
    message = html`Please log in <button>Login</button>`;
  }
  return html`<p class="message">${message}</p>`;
}
```
或者，你可以将逻辑分解为独立的函数以简化模板：

```ts
getUserMessage() {
  if (this.userName) {
    return html`Welcome ${this.userName}`;
  } else {
    return html`Please log in <button>Login</button>`;
  }
}
render() {
  return html`<p>${this.getUserMessage()}</p>`;
}
```

## 缓存模板结果：缓存指令

在大多数情况下，条件模板只需要 JavaScript 条件。但是，如果你在大型、复杂的模板之间切换，你可能就希望节省每次切换时重新创建 DOM 的成本。

在这种情况下，您可以使用 `cache` _指令_。 cache 指令为当前未渲染的模板缓存 DOM。

```ts
render() {
  return html`${cache(this.userName ?
    html`Welcome ${this.userName}`:
    html`Please log in <button>Login</button>`)
  }`;
}
```

有关详细信息，请参阅 [缓存指令]({{baseurl}}/docs/templates/directives/#cache)。

## 渲染空值

有时，你可能不想在条件运算符的一个分支中渲染任何内容。子表达式中的值 `undefined`、`null` 和空字符串 (`''`) 都会渲染一个空的文本节点。

在某些情况下，你可能希望仅在定义了数据时才将值渲染给属性，而在数据不可用时不渲染任何值。请参阅 [仅在定义数据时设置值]({{baseurl}}/docs/templates/expressions/#ifDefined) 来处理该问题。
