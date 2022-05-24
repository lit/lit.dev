---
title: 开始
eleventyNavigation:
  key: 开始
  parent: 介绍
  order: 3
versionLinks:
  v1: getting-started/
---

可以通过多种方式使用Lit：在我们的练习场和交互式教程中使用，或者直接将Lit安装到现有的项目中。

## Lit练习场

立即开始使用交互式练习场和示例。从“[Hello World]({{baseurl}}/playground)”开始，然后对其进行修改或继续阅读更多示例。

## 交互式教程


学习[分步教程]({{baseurl}}/tutorial/)，了解如何在几分钟内构建一个Lit组件。

## Lit入门套件

我们分别提供Typescript和Javascript组件的入门套件，基于它可以创建独立的，可重用的组件。在这里查看[入门套件]({{baseurl}}/docs/tools/starter-kits/)。

## 从npm安装到本地

可以通过npm将`lit`包安装到本地。

```sh
npm i lit
```

然后导入到Javascript或者Typescript文件中:

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
```

```js
import {LitElement, html} from 'lit';
```

{% endswitchable-sample %}

## 使用bundle

Lit也可作为预构建的单文件bundle提供。提供bundle是为了在开发工作流程中提供更大的灵活性：例如，如果你希望下载单个文件而不是使用npm和构建工具。bundle是没有依赖关系的标准JavaScript模块 - 任何现代浏览器都应该能够通过`<script type="module">`导入和运行bundle。

<div class="alert alert-warning">

**如果你正在使用npm作为客户端的依赖管理工具，那么你应该使用[`lit`包](#install-locally-from-npm)，而不是使用bundle。** 因为bundle把大部分或者所有的Lit的内容打包到了一个文件中，这就导致了你的页面加载了很多你并不需要的东西。

</div>

如果你想要查看bundle，请转到 <https://cdn.jsdelivr.net/gh/lit/dist/>点击下拉菜单并跳转到特定版本的页面。在bundle页面上，有该版本对应的bundle类型的目录。目前包含两种类型的hunble。

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

Open WC项目有一个[项目生成器](https://open-wc.org/docs/development/generator/)，可以使用Lit搭建一个应用程序项目。
