---
title: 本地化
eleventyNavigation:
  key: Overview
  parent: 本地化
  order: 1
---

本地化是在你的应用程序和组件中支持多种语言和地区的过程。 Lit 通过 `@lit/localize` 库对本地化提供第一方支持，该库具有许多优势，使其成为优于第三方本地化库的不错选择：

- 原生支持本地化模板中对表达式和 HTML 标记。 变量替换不需要新的语法和插值运行时——只需使用你现有的模板。

- 语言环境切换时自动重新渲染 Lit 组件。

- 大小仅 1.27 KiB（压缩后）。

- 可选择为每个语言环境编译，将额外的 JavaScript 减少到 0 KiB。

## 安装 {#installation}

安装 `@lit/localize` 客户端库和 `@lit/localize-tools` 命令行界面。

```sh
npm i @lit/localize
npm i -D @lit/localize-tools
```

## 快速入门 {#quick-start}

1. 在 `msg` 函数中包裹一个字符串或模板（[详情](#making-strings-and-templates-localizable)）。
2. 创建一个 `lit-localize.json` 配置文件 ([详情](#config-file))。
3. 运行 `lit-localize extract` 生成 XLIFF 文件 ([详情](#extracting-messages))。
4. 编辑生成的 XLIFF 文件，添加 `<target>` 翻译标签 ([详情](#translation-with-xliff))。
5. 运行 `lit-localize build` 输出字符串和模板的本地化版本 ([详情](#output-modes))。

## 使字符串和模板可本地化 {#making-strings-and-templates-localizable}

要使字符串或 Lit 模板可本地化，请将其包装在 `msg` 函数中。 `msg` 函数会返回给定字符串或模板在当前活动的语言环境中的版本。

<div class="alert alert-info">

在你没有任何可用翻译之前，`msg` 只会返回原始字符串或模板，因此即使还没有准备好实际本地化，也可以安全使用。

</div>

{% switchable-sample %}

```ts
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {msg} from '@lit/localize';

@customElement('my-greeter');
class MyGreeter extends LitElement {
  @property()
  who = 'World';

  render() {
    return msg(html`Hello <b>${this.who}</b>`);
  }
}
```

```js
import {html, LitElement} from 'lit';
import {msg} from '@lit/localize';

class MyGreeter extends LitElement {
  static properties = {
    who: {},
  };

  constructor() {
    super();
    this.who = 'World';
  }

  render() {
    return msg(html`Hello <b>${this.who}</b>`);
  }
}
customElements.define('my-greeter', MyGreeter);
```

{% endswitchable-sample %}

### Message 类型 {#message-types}

通常使用 Lit 渲染的任何字符串或模板都可以本地化，包括具有动态表达式和 HTML 标记的字符串或模板。

纯字符串：

```js
msg('Hello World');
```

带表达式的纯字符串（有关 `str` 的详细信息，请参见 [带表达式的字符串](#strings-with-expressions)）：

```js
msg(str`Hello ${name}`);
```

HTML 模板：

```js
msg(html`Hello <b>World</b>`);
```

带表达式的 HTML 模板：

```js
msg(html`Hello <b>${name}</b>`);
```

本地化 message 也可以嵌套在 HTML 模板中：

```js
html`<button>${msg('Hello World')}</button>`;
```

### 带有表达式的字符串 {#strings-with-expressions}

包含表达式的字符串必须用 `html` 或 `str` 标记才能本地化。 当字符串不包含任何 HTML 标记时，你应该使用 `str` 而不是 `html`，因为`str`的性能开销略低一些。 如果你忘记在带有表达式的字符串上添加 `html` 或 `str` 标签，则在运行 `lit-localize` 命令时会引发错误。

不正确：

<strike>

```js
import {msg} from '@lit/localize';
msg(`Hello ${name}`);
```

</strike>

正确：

```js
import {msg, str} from '@lit/localize';
msg(str`Hello ${name}`);
```

在这些情况下需要 `str` 标记，因为未标记的模板字符串字面量在被 `msg` 函数接收之前会当作常规字符串，这意味着无法捕获动态表达式值，并将其替换为字符串的本地化版本。

## 语言代码 {#locale-codes}

语言代码是标识人类语言的字符串，有时还包括区域、脚本或其他变体。

Lit Localize 不要求使用任何特定的语言环境代码系统，但强烈建议使用 <a href="https://www.w3.org/International/articles/language-tags/index.en" target="_blank" rel="noopener">BCP 47 语言标签标准</a>。 下面是一些 BCP 47 语言标签示例：

- zh: 英语
- es-419：拉丁美洲使用的西班牙语
- zh-Hans：用简体字书写的中文

### 术语 {#terms}

Lit Localize 定义了一些指代语言环境代码的术语。 本文档、Lit Localize 配置文件和 Lit Localize API 中使用了这些术语：

<dl class="params">
  <dt class="paramName">源语言环境</dt>
  <dd class="paramDetails">
    <p>用于在源代码中编写字符串和模板的语言环境。</p>
  </dd>

  <dt class="paramName">目标语言环境</dt>
  <dd class="paramDetails">
    <p>你的字符串和模板可以翻译成的语言环境。</p>
  </dd>

  <dt class="paramName">活动语言环境</dt>
  <dd class="paramDetails">
    <p>当前显示的全局语言环境。</p>
  </dd>
</dl>


## 输出模式 {#output-modes}

Lit Localize 支持两种输出模式：

- _运行时_ 模式使用 Lit Localize 的 API 在运行时加载本地化消息。

- _转换_ 模式通过为每个语言环境构建单独的 JavaScript 包来消除 Lit Localize 运行时代码。
   

<div class="alert alert-info">

**不确定要使用哪种模式？** 那就从运行时模式开始。 后期切换模式是很容易的，因为核心的 `msg` API 是相同的。

</div>

### 运行时模式 {#runtime-mode}

在运行时模式下，将为你的每个语言环境生成一个 JavaScript 或 TypeScript 模块。 每个模块都包含该语言环境的本地化模板。 当活动语言环境切换时，该语言环境的模块会被导入，并且所有本地化组件都被重新渲染。

运行时模式使得切换语言环境非常快，因为不需要重新加载页面。 但是，与转换模式相比，渲染会有轻微的性能开销。

#### 生成的输出的示例

```js
// locales/es-419.ts
export const templates = {
  hf71d669027554f48: html`Hola <b>Mundo</b>`,
};
```

有关运行时模式的完整详细信息，请参阅 [运行时模式]({{baseurl}}/docs/localization/runtime-mode) 页面。

### 转换模式 {#transform-mode}

在转换模式下，会为每个语言环境生成一个单独的目录。 每个目录都包含该语言环境中应用程序的完整独立构建，其中 `msg` 包装器和所有的 Lit Localize 运行时代码则被完全删除。

转换模式需要 0 KiB 的额外 JavaScript 代码，并且渲染速度非常快。 但是，切换语言环境需要重新加载页面，以便加载新的 JavaScript 包。

#### 生成的输出的示例

```js
// locales/en/my-element.js
render() {
  return html`Hello <b>World</b>`;
}
```

```js
// locales/es-419/my-element.js
render() {
  return html`Hola <b>Mundo</b>`;
}
```

有关转换模式的完整详细信息，请参阅 [转换模式]({{baseurl}}/docs/localization/transform-mode) 页面。

### 差异 {#differences}

<!-- TODO(aomarks) Default CSS doesn't have a margin above table -->
<br>

<table>
<thead>
<tr>
   <th></th>
   <th>运行时模式</th>
   <th>转换模式</th>
</tr>
</thead>

<tbody>
<tr>
   <td>输出</td>
   <td>为每个目标语言环境动态加载的模块。</td>
   <td>为每个语言环境构建一个独立的应用程序。</td>
</tr>

<tr>
   <td>切换语言环境</td>
   <td>调用<code>setLocale()</code></td>
   <td>重新加载页面</td>
</tr>

<tr>
   <td>JS 字节</td>
   <td>1.27 KiB（压缩后）</td>
   <td>0 KiB</td>
</tr>

<tr>
   <td>使模板可本地化</td>
   <td><code>msg()</code></td>
   <td><code>msg()</code></td>
</tr>

<tr>
   <td>配置</td>
   <td><code>configureLocalization()</code></td>
   <td><code>configureTransformLocalization()</code></td>
</tr>

<tr>
   <td>优势</td>
   <td>
     <ul>
       <li>更快的语言环境切换。</li>
       <li>在切换语言环境时减少<em>边缘</em>字节。</li>
     </ul>
   </td>
   <td>
     <ul>
       <li>渲染速度更快。</li>
       <li>单个语言环境的字节数更少。</li>
     </ul>
   </td>
</tr>
</tbody>
</table>

## 配置文件 {#config-file}

`lit-localize` 命令行工具在当前目录中查找名为 `lit-localize.json` 的配置文件。 可复制粘贴下面的示例快速上手，并查看 [CLI 和配置]({{baseurl}}/docs/localization/cli-and-config) 页面获取所有选项的完整参考。

<div class="alert alert-info">

如果你正在使用 JavaScript 进行开发，请将 `inputFiles` 属性设置为 `.js` 源文件所在的位置。 如果你正在使用 TypeScript 进行开发，请将 `tsConfig` 属性设置为 `tsconfig.json` 文件所在的位置，并将 `inputFiles` 留空。

</div>

{% switchable-sample %}

```ts
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh-Hans"],
  "tsConfig": "./tsconfig.json",
  "output": {
    "mode": "runtime",
    "outputDir": "./src/generated/locales"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

```js
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh-Hans"],
  "inputFiles": [
    "src/**/*.js",
  ]
  "output": {
    "mode": "runtime",
    "outputDir": "./src/generated/locales"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

{% endswitchable-sample %}

## 提取 message {#extracting-messages}

运行 `lit-localize extract` 为每个目标语言环境生成 <a href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html" target="_blank" rel="noopener">XLIFF</a> 文件。 XLIFF 是大多数本地化工具和服务支持的 XML 格式。 XLIFF 文件将被写入 `interchange.xliffDir` [配置选项](/docs/localization/cli-and-config/#xliff-mode-settings) 指定的目录。

```sh
lit-localize extract
```

For example, given the source:

例如，给定源语言环境代码：

```js
msg('Hello World');
msg(str`Hello ${name}`);
msg(html`Hello <b>World</b>`);
```

然后将为每个目标语言环境生成一个 `<xliffDir>/<locale>.xlf` 文件：

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
</trans-unit>
```

## 使用 XLIFF 进行翻译 {#translation-with-xliff}

XLIFF 文件可以手动编辑，但更常见的是它们被发送到第三方翻译服务，由语言专家使用专门的工具进行编辑。

将你的 XLIFF 文件上传到你选择的翻译服务后，你最终会收到新的 XLIFF 文件作为响应。 新的 XLIFF 文件和你上传的文件看起来很像，不同的是在每个 `<trans-unit>` 中都被插入了 `<target>` 标签。

当你收到新的翻译 XLIFF 文件时，将它们保存到你配置的 `interchange.xliffDir` 目录，覆盖原始版本。

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
  <target>Hola Mundo</target>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
  <target>Hola <x equiv-text="${name}"/></target>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
  <target>Hola <x equiv-text="&lt;b&gt;"/>Mundo<x equiv-text="&lt;/b&gt;"/></target>
</trans-unit>
```

## 构建本地化模板 {#building-localized-templates}

使用 `lit-localize build` 命令将翻译合并回你的应用程序。 该命令的行为取决于你配置的 [输出模式](#output-modes)。

```sh
lit-localize build
```

请参阅 [运行时模式]({{baseurl}}/docs/localization/runtime-mode) 和 [转换模式]({{baseurl}}/docs/localization/transform-mode) 页面，了解在每种模式下构建是如何工作的。

## Message 说明 {#message-descriptions}

使用 `msg` 函数的 `desc` 选项为你的字符串和模板提供人类可读的说明。 大多数翻译工具都会向翻译人员显示这些说明，强烈建议帮助翻译人员解释和语境化消息的含义。

```js
render() {
  return html`<button>
    ${msg("Launch", {
      desc: "Button that begins rocket launch sequence.",
    })}
  </button>`;
}
```

使用 `<note>` 元素在 XLIFF 文件中表示说明。

```xml
<trans-unit id="s512957aa09384646">
  <source>Launch</source>
  <note>Button that begins rocket launch sequence.</note>
</trans-unit>
```

## Message ID {#message-ids}

Lit Localize 使用字符串的哈希值自动为每个 `msg` 调用生成一个 ID。

如果两个 `msg` 调用共享相同的 ID，那么它们将被视为相同的消息，这意味着它们将被翻译为一个单元，并且在两个地方将替换相同的翻译。

例如，这两个 `msg` 调用位于两个不同的文件中，但由于它们具有相同的内容，它们将被视为一条消息：

```js
// file1.js
msg('Hello World')

// file2.js
msg('Hello World')
```

### ID 的生成 {#id-generation}

以下内容会影响 ID 的生成：

- 字符串内容
- HTML 标记
- 表达式的位置
- 字符串是否带有 `html` 标记

以下内容**不会**影响 ID 的生成：

- 表达式中的代码
- 表达式的计算值
- 说明的内容
- 文件位置

例如，下面这些 message 共享相同的 ID：

```js
msg(html`Hello <b>${name}</b>`);
msg(html`Hello <b>${this.name}</b>`);
msg(html`Hello <b>${this.name}</b>`, {desc: 'A friendly greeting'});
```

但是这个 message 会有不同的 ID：

```js
msg(html`Hello <i>${name}</i>`);
```

### 覆盖 ID {#overriding-ids}

可以通过为 `msg` 函数指定 `id` 选项来覆盖消息 ID。 在某些情况下，这可能是必要的，例如一个相同的字符串具有多种含义，因为每个含义在另一种语言中的写法可能不同：

```js
msg('Buffalo', {id: 'buffalo-animal-singular'});
msg('Buffalo', {id: 'buffalo-animal-plural'});
msg('Buffalo', {id: 'buffalo-city'});
msg('Buffalo', {id: 'buffalo-verb'});
```
