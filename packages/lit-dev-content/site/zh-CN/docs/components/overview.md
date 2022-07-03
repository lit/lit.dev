---
title: 组件预览
eleventyNavigation:
  key: 组件预览
  parent: 组件
  order: 0
versionLinks:
  v1: components/templates/
---

一个 Lit 组件是一个可重用的 UI 片段，你可以认为 Lit 组件是一个具有状态，并且根据状态来展示其 UI 的容器。它还可以对用户输入，触发事件做出响应，你希望 UI 组件做的事情，它几乎都可以做。同时，一个 Lit 组件就是一个 HTML 元素，因此 Lit 组件具有所有的标准 HTML 元素的 API。

创建 Lit 组件涉及到以下几个概念:

 *   [定义组件]({{baseurl}}/docs/components/defining/)。 一个 Lit 组件被实现为一个*自定义元素*，将被注册到浏览器中。

 *   [渲染]({{baseurl}}/docs/components/rendering/)。 每个组件都有一个*render方法*，在 render 方法中，你需要为组件定义一个*模板*。然后 render 方法会被调用来渲染组件的内容。

*   [响应式属性]({{baseurl}}/docs/components/properties/)。 属性保存组件的状态。更改一个或多个组件的“响应式属性”会触发更新周期重新渲染组件。

*   [样式]({{baseurl}}/docs/components/styles/)。 组件可以定义“封装样式”来控制自己的外观。

*   [生命周期]({{baseurl}}/docs/components/lifecycle/)。Lit 定义了一组回调函数，你可以覆盖这些回调函数，这些回调函数会挂钩到组件的生命周期中。例如，在元素添加到页面时或组件更新时会触发回调函数。

这里有一个示例组件:

{% playground-example "docs/components/overview/simple-greeting" "simple-greeting.ts" %}
