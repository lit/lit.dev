---
title: 组件组合
eleventyNavigation:
  parent: 组合
  key: 组件组合
  order: 2
---

_组件组合_ 是处理复杂度和将 Lit 代码分解为单独单元的最常见方法：即用更小、更简单的组件构建大型、复杂组件的过程。 想象一下，你的任务是实现一个如下的 UI：

![显示一组动物照片的应用程序的屏幕截图。 该应用程序有一个带有标题（“Fuzzy”）的顶部栏和一个菜单按钮。 左侧菜单抽屉打开，显示一组选项。](/images/docs/composition/fuzzy-screenshot.png)

你可能可以确定实现起来会涉及一些复杂性的领域。 这些很有可能是组件。

通过将复杂性隔离到特定的组件中，可以使工作变得更加简单，然后可以将这些组件组合在一起创建出整体设计。

例如，上面这个比较简单的屏幕截图涉及许多可能的组件：顶部栏、菜单按钮、带有用于导航的菜单项的抽屉和一个主要内容区域。上述每一个都可以由一个组件表示。 一个复杂的组件，例如带有导航菜单的抽屉，可能会分解成许多更小的组件：抽屉本身、打开和关闭抽屉的按钮、菜单、单个菜单项。

Lit 允许你通过向模板添加元素来进行创作——无论这些元素是内置的 HTML 元素还是自定义元素。

```js
render() {
  return html`
    <top-bar>
      <icon-button icon="menu" slot="nav-button"></icon-button>
      <span slot="title">Fuzzy</span>
    </top-bar>
    `;
}
```

##  什么是好的组件

在决定如何分解功能时，有几件事可以帮助确定何时制作新组件。 如果以下一项或多项适用，则把一段 UI 封装为组件是一个好的选择：

*   它有自己的状态。
*   它有自己的模板。
*   它被多个地方使用，无论是当前组件还是其他组件。
*   它专注于做好一件事。
*   它有一个定义良好的 API。

按钮、复选框和输入字段等可重复使用的控件可以构成出色的组件。 但更复杂的 UI 部件（如抽屉和轮播）也非常适合组件化。

##  在 DOM 树向上/下传递数据

与子组件交换数据时，一般规则是遵循 DOM 的模型：_属性向下_，_事件向上_。

*   属性向下。在子组件上设置属性通常比在子组件上调用方法更可取。 在 Lit 模板和其他声明性模板系统中设置属性很容易。
*   事件向上。 在 Web 平台中，触发事件是元素在 DOM 树向上发送信息的默认方法，通常是为了响应用户交互。这使宿主组件可以响应事件，或者为更远的树上的祖先转换或重新触发事件。

该模型的一些含义：

*   组件应该是其 shadow DOM 中子组件的真实源。子组件不应在其宿主组件上设置属性或调用方法。

*   如果一个组件改变了自己的公共属性，它应该触发一个事件来通知 DOM 树中更高层的组件。通常，这些更改是用户操作的结果——例如：按下按钮或选择菜单项。 想想原生的 `input` 元素，它会在用户更改输入值时触发一个事件。

一个菜单组件，它包含一组菜单项，并将 `items` 和 `selectedItem` 属性作为其公共 API 的一部分。 它的 DOM 结构可能如下所示：

![表示菜单的 DOM 节点层次结构。 顶层节点（my-menu）有一个 ShadowRoot，其中包含三个 my-item 元素。](/images/docs/composition/composition-menu-component.png)

当用户选择一个项目时，`my-menu` 元素应该更新它的 `selectedItem` 属性。它还应该触发一个事件来通知父组件选择已更改。完整的流程应该是这样的：

- 用户与 item 交互，导致事件触发（无论是像 `click` 这样的标准事件，还是某些特定于 `my-item` 组件的事件）。
- `my-menu` 元素捕捉到事件，然后更新自己的 `selectedItem` 属性。它还可能更改某些状态，以便高亮显示所选 item。
- `my-menu` 元素触发一个语义事件，表示选择已被更改。 例如，这个事件可能被称为“selected-item-changed”。 由于此事件是 `my-menu` 的 API 的一部分，因此它应该在该上下文中具有语义意义。

有关分发和监听事件的更多信息，请参阅 [Events]({{baseurl}}/docs/components/events/)。

## 跨 DOM 树传递数据

属性向下和事件上升是一个很好的起步规则。 但是，如果你需要在没有直系后代关系的两个组件之间交换数据怎么办？ 例如，shadow 树中的两个兄弟组件？

解决这个问题的一种方法是使用 _中介模式_。 在中介模式中，对等组件不直接相互通信。 相反，所有的交互都是由第三方 _中介_ 来进行。

实现中介模式的一种简单方法是让父组件处理来自其子级的事件，然后将更改的数据向下传递回 DOM 树，根据需要更新其子级的状态。通过添加中介，你可以使用熟悉的事件向上、属性向下原则在 DOM 树中传递数据。

在下面的示例中，中介元素在其 shadow DOM 中监听来自 input 和 button 元素的事件。它控制按钮的启用状态，因此用户只有在输入中有文本时才能单击**提交**按钮。

{% playground-example "docs/composition/mediator-pattern" "mediator-element.ts" %}

其他中介模式包括 Flux/Redux 风格的模式，它们 store 作为中介，通过订阅的方式来获取更改和更新组件的消息。让组件直接订阅更改有助于避免需要每个父级传递其子级所需的所有数据。


## Light DOM 子节点

除了 shadow DOM 中的节点之外，你还可以渲染组件用户提供的子节点，例如标准的 `<select>` 元素可以接收一组 `<option>` 元素作为子节点并将它们渲染为菜单项。

子节点有时被称为“light DOM”，以便将它们与组件的 shadow DOM 区分开来。 例如：

```html
<top-bar>
  <icon-button icon="menu" slot="nav-button"></icon-button>
  <span slot="title">Fuzzy</span>
</top-bar>
```


这里的 `top-bar` 元素有两个由用户提供的light DOM 子元素：一个导航按钮和一个标题。

与 light DOM 子节点交互不同于与 shadow DOM 中的节点交互。 组件的 shadow DOM 中的节点由组件管理，不应从组件外部访问。 Light DOM 子节点在组件外部进行管理，但也可以由组件访问。组件的用户可以随时添加或删除 light DOM 子节点，因此组件不能假定其子节点是一组静态的节点。

组件可以使用其 shadow DOM 中的 `<slot>` 元素来控制是否以及在何处渲染子节点。并且它可以通过监听 `slotchange` 事件在添加和删除子节点时接收通知。

有关更多信息，请参阅[使用插槽渲染子节点]({{baseurl}}/docs/components/shadow-dom/#slots) 和 [访问插槽子节点]({{baseurl}}/docs/components/shadow-dom/#accessing-slotted-children) 的部分。

_[Anggit Rizkianto](https://unsplash.com/@anggit_mr) 在 [Unsplash](https://unsplash.com/photos/x3-OP_X0aH0) 上拍摄的猫鼬照片。_