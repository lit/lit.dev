---
title: 什么是Lit?
eleventyNavigation:
  key: What is Lit?
  parent: Introduction
  order: 1
versionLinks:
  v1:
---

![Lit Logo]({{ site.baseurl }}/images/logo.svg){.logo width="425" height="200"}

Lit是一个简洁的、快速的、轻量的用于构建Web组件的库。

Lit的核心是一个消除样板代码的组件基类，它提供响应式状态、作用域样式和一个小巧、快速且富有表现力的声明式模板系统。

## Lit可以做什么?

您可以使用Lit构建几乎任何类型的Web UI!

你需要知道关于Lit的第一件事就是:**每一个Lit组件都是一个标准的[Web组件](https://developer.mozilla.org/en-US/docs/Web/Web_Components)**。Web组件具有很强的、受浏览器原生支持的互操作性，Web组件可以在任何HTML环境中使用，也可以在任何框架中使用，当然，没有框架也可以。

Lit组件可以跨app和网站使用，甚至可以在不同的前端技术栈之间使用，而网站的开发者无需知道Lit组件的内部实现细节和Lit代码，直接像使用内置HTML元素一样式样Lit组件，这使得Lit成为我们开发**共享组件和设计系统**的一个理想选择。

Lit也非常适合**逐步增强基本HTML网站**。无论你的网站是手写的、通过CMS管理的、使用服务器端框架构建的，还是由Jekyll或elevnty等工具生成的，浏览器都会识别标记中的Lit组件并自动初始化它们。

当然，你也可以使用Lit组件构建**高度交互、功能丰富的应用程序**，就像使用React或Vue之类的框架一样。Lit的功能和开发体验可与这些流行的替代方案相媲美，但Lit通过采用浏览器的原生组件模型，最大限度地减少锁定，最大限度地提高灵活性从而提高可维护性。

当你使用Lit构建应用程序时，很容易加入“vanilla”Web组件或使用其他库构建的Web组件。你可以一次只更新一个组件，可以是更新到Lit的新版本，甚至是迁移到另外一个库，而这个过程不会中断产品开发。

## 使用Lit开发是什么样的?

如果你做过任何现代的、基于组件的Web开发，你应该对Lit感到很熟悉。即使你之前没有使用组件进行开发，我们认为你会发现Lit非常容易上手。

每个Lit组件都是一个由更小的构建块组装而成的独立的UI单元，构建块包括：标准的HTML元素和其他Web组件。反过来，每个Lit组件本身就是一个构建块，HTML文档、Web组件或者框架组件可以使用他们来构建更大、更复杂的界面。

这里有一个小但是具有代表性的组件（倒计时），它说明了Lit代码的外观并突出显示了几个关键特性：

{% playground-ide "docs/what-is-lit/" %}

注意事项:

* Lit的主要功能是`LitElement`基类，它是原生`HTMLElement`的方便且通用的扩展。您可以从它扩展来定义您自己的组件。
* Lit的[表达性、声明式模板](/zh-CN/docs/templates/overview/)（利用JavaScript标记的模板文字）可以轻松描述组件的渲染方式。
* [响应式属性](/zh-CN/docs/components/properties/)表示组件的公共API和/或内部状态；每当响应式属性发生变化时，组件就会自动重新渲染。
* [Styles](/zh-CN/docs/components/styles)默认是带作用域的，这让你的CSS选择器变得简单，同时确保你的组件的样式不会污染（或被污染）周围的上下文。
* Lit在原生JavaScript中就能工作得很好，但是你也可以使用TypeScript通过使用装饰器和类型声明来获得更好的开发体验。

Lit在开发过程中不需要编译或构建，因此如果你愿意，它几乎可以在无工具的情况下使用。但是你也可以很容易地获得一流的[IDE支持](/zh-CN/docs/tools/development/#ide-plugins)（代码完成、linting 等）和 [生产工具](/zh-CN/docs/tools/production/)（本地化、模板缩小等）。

## 为什么选择Lit?

前面我们已经说过，Lit是构建各种Web UI的绝佳选择，它将Web组件的基于互操作的优势与现代、符合人体工程学的开发体验结合在了一起。

Lit的优势还有:

* **简洁** 在Web Components标准之上构建，Lit添加了让您感到快乐和高效的东西：响应式、声明式模板和一些周到的功能，可以减少样板文件并使你的工作更轻松。
* **快速** 更新速度很快，因为Lit会跟踪UI的动态部分，并且只在底层状态发生变化时更新被修改的部分，无需重建整个虚拟树并将其与DOM的当前状态进行比较。
* **轻量** Lit的大小约为5KB（压缩后），有助于保持较小的包大小并缩短加载时间。

Lit背后的团队从第一天起就参与了Web Components。并帮助Google维护数以万计的组件，提供一套全面的Web组件polyfill，并深入参与标准和社区工作。

考虑到Web平台的演变，Lit的每个功能都经过精心地设计；我们的目标是帮助你充分利用平台今天提供的功能，同时编写准备好从未来增强功能中受益的代码。

## 下一步

* [开始](/zh-CN/docs/getting-started/): 准备好开始使用Lit进行开发。
* [组件](/zh-CN/docs/components/overview/): 了解Lit组件模型。
* [模版](/zh-CN/docs/templates/overview/): 使用lit-html语法编写模板。
* [组织代码](/zh-CN/docs/composition/overview/): 编写可服用，可维护的代码。

