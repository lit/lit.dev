---
title: 开始
eleventyNavigation:
  key: 开始
  parent: 介绍
  order: 3
versionLinks:
  v1: getting-started/
---

可以通过多种方式使用 Lit：在我们的游乐场和交互式教程中使用，或者直接将 Lit 安装到现有的项目中。

## Lit游乐场

立即开始使用交互式游乐场和示例。从“[Hello World]({{baseurl}}/playground)”开始，然后对其进行修改或继续阅读更多示例。

## 交互式教程

学习[分步教程]({{baseurl}}/tutorials/)，了解如何在几分钟内构建一个 Lit 组件。

## Lit入门套件

我们分别提供 Typescript 和 Javascript 组件的入门套件，基于它可以创建独立的，可重用的组件。在这里查看[入门套件]({{baseurl}}/docs/tools/starter-kits/)。

## 从 npm 安装到本地

可以通过 npm 将 `lit` 包安装到本地。

```sh
npm i lit
```

然后导入到 Javascript 或者 Typescript 文件中:

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
```

```js
import {LitElement, html} from 'lit';
```

{% endswitchable-sample %}

## 使用 bundle

Lit 也可作为预构建的单文件 bundle 提供。提供 bundle 是为了在开发工作流程中提供更大的灵活性：例如，如果你希望下载单个文件而不是使用 npm 和构建工具。bundle 是没有依赖关系的标准 JavaScript 模块 - 任何现代浏览器都应该能够通过 `<script type="module">` 导入和运行 bundle。

<div class="alert alert-warning">

**如果你正在使用 npm 作为客户端的依赖管理工具，那么你应该使用[`lit`包](#install-locally-from-npm)，而不是使用 bundle。** 因为 bundle 把大部分或者所有的 Lit 的内容打包到了一个文件中，这就导致了你的页面加载了很多你并不需要的东西。

</div>

如果你想要查看 bundle，请转到 <https://cdn.jsdelivr.net/gh/lit/dist/> 点击下拉菜单并跳转到特定版本的页面。在 bundle 页面上，有该版本对应的 bundle 类型的目录。目前包含两种类型的 hunble。

<dl class="params">
  <dt class="paramName">core</dt>
  <dd class="paramDetails">
    <a href="https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js">
      https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js
    </a>
    <br>
    <code>core</code> 导出与
    <a href="https://github.com/lit/lit/blob/main/packages/lit/src/index.ts">
    <code>lit</code>包的主模块</a>相同的内容。
  </dd>

  <dt class="paramName">all</dt>
  <dd class="paramDetails">
    <a href="https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js">
      https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js
    </a>
    <br>
    <code>all</code>导出<code>core</code>的所有内容，以及
    <a href="https://github.com/lit/lit/blob/main/packages/lit/src/index.all.ts">
    <code>lit</code>其他大部分模块的内容</a>。
  </dd>
  </dd>
</dl>

## 在现有项目添加Lit

请参阅[将Lit添加到现有项目]({{baseurl}}/docs/tools/adding-lit)，将Lit添加到现有项目或应用程序。

## Open WC 项目生成器

Open WC 项目有一个[项目生成器](https://open-wc.org/docs/development/generator/)，可以使用 Lit 搭建一个应用程序项目。
