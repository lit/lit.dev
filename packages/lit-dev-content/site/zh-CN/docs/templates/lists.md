---
title: 列表
eleventyNavigation:
  key: 列表
  parent: 模板
  order: 4
versionLinks:
  v1: components/templates/#use-properties-loops-and-conditionals-in-a-template
---

你可以使用标准 JavaScript 结构来创建重复模板。

Lit 还提供一个 `repeat` 指令来更有效地构建某些类型的动态列表。

## 渲染数组

当子节点所在位置中的表达式返回数组或可迭代对象时，Lit 会渲染数组中的所有项：

{% playground-example "docs/templates/lists-arrays/" "my-element.ts" %}

在大多数情况下，你需要将数组项转换为更有用的形式。

##  使用 map 重复模板

要渲染列表，你可以使用 `map` 将数据列表转换为模板列表：

{% playground-example "docs/templates/lists-map/" "my-element.ts" %}

请注意，此表达式返回一个 `TemplateResult` 的对象数组。 Lit 将渲染一个数组或可迭代对象的子模板和其他值。

## 使用循环语句重复模板

你还可以构建一个模板数组并将其传递给模板表达式。

```ts
render() {
  const itemTemplates = [];
  for (const i of this.items) {
    itemTemplates.push(html`<li>${i}</li>`);
  }

  return html`
    <ul>
      ${itemTemplates}
    </ul>
  `;
}
```

## repeat 指令

在大多数情况下，使用循环或 `map` 是构建重复模板的有效方法。但是，如果想重新排序一个大列表，或者通过添加和删除单个条目来改变列表，这种方法可能涉及更新大量 DOM 节点。

The `repeat` directive can help here.

The repeat directive performs efficient updates of lists based on user-supplied keys:

`repeat` 指令可以在这里提供帮助。

repeat 指令根据用户提供的键执行有效的列表更新：

```ts
repeat(items, keyFunction, itemTemplate)
```

参数:

*   `items` 是一个数组或可迭代对象。
*   `keyFunction` 是一个将单个项目作为参数并返回该项目能作为唯一键的值的函数。
*   `itemTemplate` 是一个模板函数，它将项目及其当前索引作为参数，并返回一个 `TemplateResult`。

例如:

{% playground-example "docs/templates/lists-repeat/" "my-element.ts" %}

如果你重新排序 `employees` 数组，`repeat` 指令会重新排序现有的 DOM 节点。

To compare this to Lit's default handling for lists, consider reversing a large list of names:
要将其与 Lit 对列表的默认处理进行比较，请考虑反转大量名称：

*   For a list created using `map`, Lit maintains the DOM nodes for the list items, but reassigns the values.
*   For a list created using `repeat`, the `repeat` directive reorders the _existing_ DOM nodes, so the nodes representing the first list item move to the last position.


### When to use map or repeat

Which repeat is more efficient depends on your use case:

*   If updating the DOM nodes is more expensive than moving them, use the `repeat` directive.

*   If the DOM nodes have state that _isn't_ controlled by a template expression, use the `repeat` directive.

    For example, consider this list:

    ```js
    html`${this.users.map((user) =>
      html`
      <div><input type="checkbox"> ${user.name}</div>
    }`
    ```

    The checkbox has a checked or unchecked state, but it isn't controlled by a template expression.

    If  you reorder the list after the user has checked one or more checkboxes, Lit would update the names associated with the checkboxes, but not the state of the checkboxes.

 If neither of these situations apply, use `map` or looping statements.

