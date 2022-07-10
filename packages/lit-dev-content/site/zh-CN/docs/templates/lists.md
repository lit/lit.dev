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

## 渲染数组 {#rendering-arrays}

当子节点所在位置中的表达式返回数组或可迭代对象时，Lit 会渲染数组中的所有项：

{% playground-example "docs/templates/lists-arrays/" "my-element.ts" %}

在大多数情况下，你需要将数组项转换为更有用的形式。

##  使用 map 渲染重复模板 {#repeating-templates-with-map}

要渲染列表，你可以使用 `map` 将数据列表转换为模板列表：

{% playground-example "docs/templates/lists-map/" "my-element.ts" %}

请注意，该表达式会返回一个 `TemplateResult` 类型的对象数组。 Lit 将渲染一个数组或可迭代对象的子模板和其他值。

## 使用循环语句重复模板 {#repeating-templates-with-looping-statements}

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

## repeat 指令 {#the-repeat-directive}

在大多数情况下，使用循环或 `map` 是构建重复模板的有效方法。但是，如果想重新排序一个大列表，或者通过添加和删除单个条目来改变列表，这种方法可能涉及更新大量 DOM 节点。

`repeat` 指令可以在这里提供帮助。

repeat 指令会根据用户提供的键执行有效的列表更新：

```ts
repeat(items, keyFunction, itemTemplate)
```

参数:

*   `items` 是一个数组或可迭代对象。
*   `keyFunction` 是一个将单个项目作为参数并返回该项目能作为唯一键的值的函数。
*   `itemTemplate` 是一个模板函数，它将项目及其当前索引作为参数，并返回一个 `TemplateResult`。

例如:

{% playground-example "docs/templates/lists-repeat/" "my-element.ts" %}

如果重新排序 `employees` 数组，`repeat` 指令只会重新排序现有的 DOM 节点。

要将 repeat 指令与 Lit 对列表的默认处理方式进行比较，可以考虑倒置包含大量项目的列表的情况：

*   对于使用 `map` 创建的列表，Lit 会维护列表项的 DOM 节点，但会给节点重新设置新值（而不会改变节点顺序）。
*   对于使用 `repeat` 创建的列表，`repeat` 指令只会重新排序 _已存在_ DOM 节点，因此代表第一个列表项的节点会移动到最后一个位置。


### 什么时候使用map 或 repeat {#when-to-use-map-or-repeat}

哪种重复方式更高效取决于你的场景:

*   如果更新 DOM 节点比移动节点开销更大，请使用 `repeat` 指令。

*   如果 DOM 节点的状态_不_由模板表达式控制，请使用 `repeat` 指令。

    例如，考虑如下列表：

    ```js
    html`${this.users.map((user) =>
      html`
      <div><input type="checkbox"> ${user.name}</div>
    }`
    ```

    复选框具有选中或未选中状态，但不受模板表达式的控制。

    如果在用户选中一个或多个复选框后重新排序列表，Lit 会更新与复选框关联的名称，但不会更新复选框的状态。

  如果这两种情况都不适用，请使用 `map` 或循环语句。

