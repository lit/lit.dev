---
title: 什么是 Lit ?
eleventyNavigation:
  key: 什么是 Lit ?
  parent: 介绍
  order: 1
versionLinks:
  v1:
---

![Lit Logo]({{ site.baseurl }}/images/logo.svg){.logo width="425" height="200"}

 Lit 是一个简洁的、快速的、轻量的用于构建 Web 组件的库。

 Lit 的核心是一个可以消除样板代码的组件基类，它提供响应式状态、作用域样式和一个小巧、快速且富有表现力的声明式模板系统。

## Lit 可以做什么?

你可以使用 Lit 构建几乎任意类型的 Web UI!

你需要知道关于 Lit 的第一件事就是：**每一个 Lit 组件都是一个标准的[Web 组件](https://developer.mozilla.org/en-US/docs/Web/Web_Components)**。 Web 组件具有很强的、浏览器原生支持的互操作性，Web 组件可以在任何 HTML 环境中使用，也可以在任何框架中使用，当然，没有框架也可以。

Lit 组件可以跨 App 和网站使用，甚至可以在不同的前端技术栈之间使用，而网站的开发者无需知道 Lit 组件的内部实现细节和 Lit 代码，就像使用内置 HTML 元素一样直接使用 Lit 组件，这使得 Lit 成为我们开发**共享组件和设计系统**的一个理想选择。

Lit 也非常适合**渐进增强基本 HTML 网站**。无论你的网站是手写的、通过CMS管理的、使用服务器端框架构建的，还是由 Jekyll 或 elevnty 等工具生成的，浏览器都会识别标记中的 Lit 组件并自动初始化它们。

当然，你也可以使用 Lit 组件构建**高度交互、功能丰富的应用程序**，就像使用 React 或 Vue 之类的框架一样。 Lit 的功能和开发体验可与这些流行的替代方案相媲美，但 Lit 通过采用浏览器的原生组件模型，最大限度地减少锁定，最大限度地提高灵活性进而提高可维护性。

当你使用 Lit 构建应用程序时，很容易加入 “vanilla” Web 组件或使用其他库构建的 Web 组件。你可以一次只更新一个组件，可以是更新到 Lit 的新版本，甚至是迁移到另外一个库，而这个过程不会中断产品开发。

## 使用 Lit 开发是什么体验?

如果你做过任何现代的、基于组件的 Web 开发，那么，你应该对 Lit 感到很熟悉。即使你之前没有使用组件进行开发过，我们认为你也会发现 Lit 非常容易上手。

每个 Lit 组件都是一个由更小的构建块组装而成的独立的UI单元，构建块包括：标准的 HTML 元素和其他 Web 组件。反过来，每个 Lit 组件本身就是一个构建块，HTML 文档、 Web 组件或者框架组件都可以可以使用 Lit 组件来构建更大、更复杂的界面。

这里有一个很小但极具有代表性的组件（倒计时），它展示了 Lit 代码的外观并突出展示了几个关键特性：

{% playground-ide "docs/what-is-lit/" %}

注意事项:

*  Lit 的主要功能是 `Lit Element` 基类，它是原生 `HTMLElement` 的方便且通用的扩展。你可以继承它来定义自己的组件。
*  Lit 的[表达性、声明式模板](/zh-CN/docs/templates/overview/)（利用 JavaScript 的标签模板字符串）可以轻松描述组件的渲染方式。
* [响应式属性](/zh-CN/docs/components/properties/)表示组件的公共API和/或内部状态；每当响应式属性发生变化时，组件就会自动重新渲染。
* [样式](/zh-CN/docs/components/styles)默认是带作用域的，这让你的CSS选择器变得简单，同时确保你的组件样式不会污染（或被污染）周围的上下文。
*  Lit 在原生 JavaScript 中就能工作得很好，但是你也可以使用 TypeScript，通过使用装饰器和类型声明来获得更好的开发体验。

Lit 在开发过程中不需要编译或构建，因此如果你愿意，它几乎可以在无工具的情况下使用。但是你也可以很容易地获得一流的[IDE 支持](/zh-CN/docs/tools/development/#ide-plugins)（代码补全、linting 等）和 [生产工具](/zh-CN/docs/tools/production/)（本地化、模板压缩等）。

## 为什么选择 Lit ?

前面我们已经说过，Lit 是构建各种 Web UI 的绝佳选择，它将 Web 组件的基于互操作的优势与现代、符合人体工程学的开发体验结合在了一起。

Lit 的优势还有:

* **简洁** 在 Web 组件标准之上构建， Lit 添加了让你感到快乐和高效的东西：响应式、声明式模板和一些好用的功能，可以减少样板代码并使你的工作更轻松。
* **快速** 更新速度很快，因为 Lit 只会跟踪 UI 的动态部分，并且只在底层状态发生变化时更新被修改的部分，无需重建整个虚拟树并将其与 DOM 的当前状态进行比较。
* **轻量** Lit 的大小约为 5KB（压缩后），有助于保持较小的包大小并缩短加载时间。

Lit 背后的团队从第一天起就参与了 Web 组件的工作。并帮助 Google 维护数以万计的组件，提供一套全面的 Web 组件 polyfill，并深入参与标准和社区工作。

考虑到 Web 平台的演变，Lit 的每个功能都经过精心地设计；我们的目标是帮助你充分利用平台今天提供的功能，同时编写准备好从未来增强功能中受益的代码。

## 下一步

* [开始](/zh-CN/docs/getting-started/): 准备好开始使用 Lit 进行开发。
* [组件](/zh-CN/docs/components/overview/): 了解 Lit 组件模型。
* [模板](/zh-CN/docs/templates/overview/): 使用 lit-html 语法编写模板。
* [组织代码](/zh-CN/docs/composition/overview/): 编写可复用，可维护的代码。

