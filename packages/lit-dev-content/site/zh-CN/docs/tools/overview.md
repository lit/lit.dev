---
title: 工具和工作流概览
eleventyNavigation:
  key: 概览
  parent: 工具
  order: 1
versionLinks:
  v1: lit-html/tools/
---

Lit 组件使用纯 JavaScript 或 TypeScript 编写，并在现代浏览器上以最少的工具开箱即用，因此你不需要任何特定于 Lit 的编译器、工具或工作流。

然而，Lit 使用了非常 _现代_ 的 web 平台特性，因此它确实需要一些工具和 polyfill 才能在旧版浏览器上运行。一些工具还需要配置选项来处理现代 JavaScript。而且，虽然 Lit “只是 JavaScript”，但有一些工具可以更好地使用 Lit 的 Web 组件。

工具和工作流文档涵盖了不同的开发阶段：

* [需求]({{baseurl}}/docs/tools/requirements/)：工具和浏览器与 Lit 一起工作的常见要求，以及旧版浏览器所需的编译器选项和 polyfill。
* [开发]({{baseurl}}/docs/tools/development/)：设置本地开发环境，包括开发服务器、linting、格式化、语法高亮和类型检查。
* [测试]({{baseurl}}/docs/tools/testing/)：在现代和旧版浏览器中测试 Lit 项目的建议。
* [发布]({{baseurl}}/docs/tools/publishing/)：将组件包发布到 npm 的指南。
* [为生产而构建]({{baseurl}}/docs/tools/production/)：为生产构建应用程序，包括为现代和旧版浏览器打包、优化和差异化服务。
* [Starter Kits]({{baseurl}}/docs/tools/starter-kits)：关于使用我们用于 JavaScript 和 TypeScript 的 Lit 组件入门工具包的说明。
* [添加 Lit]({{baseurl}}/docs/tools/adding-lit)：安装 Lit 并将其添加到现有项目。