---
title: Lit Labs
eleventyNavigation:
  key: Lit Labs
  parent: 相关库
  order: 3
---


Lit Labs 是与 Lit 相关但尚未准备好投入生产的项目的保护伞。 这些项目可能是实验性的或不完整的，并且可能会发生重大变化。 Lit Labs 项目在 `@lit-labs` npm 范围内发布。

当前的 Lit Labs 项目包括：

* [Motion]（https://github.com/lit/lit/blob/main/packages/labs/motion/README.md#lit-labsmotion）。 Lit 模板的动画助手。 `@lit-labs/motion` 包包含一个 `animate` 指令，用于在元素更改状态时添加补间动画，以及用于以编程方式控制和协调动画的 `AnimateController` 类。你可以在 [Playground](https://lit.dev/playground/#sample=examples/motion-simple) 中找到更多 motion 示例。
* [React]（https://github.com/lit/lit/tree/main/packages/labs/react#lit-labsreact）。用于自定义元素和响应式控制器的响应集成助手。
* [scoped-registry-mixin](https://github.com/lit/lit/tree/main/packages/labs/scoped-registry-mixin#lit-labsscoped-registry-mixin) 与推测性 [Scoped CustomElementRegistry polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/scoped-custom-element-registry) 集成的 Lit 的 Mixin。
* [SSR]（https://github.com/lit/lit/tree/main/packages/labs/ssr#lit-labsssr）。用于服务器端渲染 Lit 模板和组件的包。
* [Task]（https://github.com/lit/lit/blob/main/packages/labs/task/README.md#lit-labstask）。用于处理异步任务的响应式控制器。

当 Lit Labs 项目准备好投入生产时，它可能会迁移到 Lit Labs 之外的新位置。例如，[`@lit/localize`]({{baseurl}}/docs/localization/overview/) 包最初也只是一个 Lit Labs 项目。