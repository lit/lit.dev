---
title: 本地化CLI与配置
eleventyNavigation:
  key: CLI与配置
  parent: 本地化
  order: 4
---

## CLI

```sh
lit-localize command [--flags]
```

### 命令

<br>

| 命令   | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extract` | 从所有输入文件中提取 `msg` 调用并创建或更新 XLIFF (`.xlf`) 文件。                                                                                                                                                                                                                                                                           |
| `build`   | 使用配置中的 [mode](/docs/localization/overview/#output-modes) 将翻译重新合并到你的应用程序中。 |

### 选项

<br>

| 选项       | 描述                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `--help`   | Display help about usage. 显示使用帮助的相关信息。                                                   |
| `--config` | JSON [配置文件](#config-file) 的路径。 默认为 `./lit-localize.json` |

## 配置文件

### 常规配置

<div class="alert alert-info">

所有文件路径都相对于配置文件的位置。

</div>

<dl class="params">
  <dt class="paramName">sourceLocale</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>必填</em></p>
    <p>源语言代码中模板写入的语言环境代码。</p>
  </dd>

  <dt class="paramName">targetLocales</dt>
  <dd class="paramDetails">
    <code class="paramType">string[]</code>
    <p><em>必填（可以为空）</em></p>
    <p>模板将被本地化的目标语言环境代码。Locale codes that templates will be localized to.</p>
  </dd>

  <dt class="paramName">inputFiles</dt>
  <dd class="paramDetails">
    <code class="paramType">string[]</code>
    <p><em>除非指定了 <code>tsConfig</code>，否则必填</em></p>
    <p>文件名数组或
    <a href="https://github.com/mrmlnc/fast-glob#pattern-syntax" target="_blank" rel="noopener">
    glob</a> 模式匹配的 JavaScript 或 TypeScript 文件，并从中提取 message。</p>
    <p>如果同时指定了 <code>tsConfig</code> 和 <code>inputFiles</code>，则
    <code>inputFiles</code> 优先。</p>
  </dd>

  <dt class="paramName">tsConfig</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>除非指定了 <code>inputFiles</code>，否则必填</em></p>
    <p><code>tsconfig.json</code> 或 <code>jsconfig.json</code> 文件的路径
    为转换模式指定被从中提取 message 的 JavaScript 或 TypeScript 文件，以及构建时将使用的编译器选项。</p>
    <p>如果同时指定了 <code>tsConfig</code> 和 <code>inputFiles</code>，则
    <code>inputFiles</code> 优先。</p>
  </dd>

  <dt class="paramName">output.mode</dt>
  <dd class="paramDetails">
    <code class="paramType">"transform" | "runtime"</code>
    <p><em>必填</em></p>
    <p>应该产生什么样的输出。请参阅
    <a href="{{baseurl}}/docs/localization/overview/#output-modes">模式</a>.</p>
  </dd>

  <dt class="paramName">output.localeCodesModule</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>可选</em></p>
    <p>生成的 JavaScript 或 TypeScript 模块的文件路径
      该模块使用配置文件中的语言环境代码导出 <code>sourceLocale</code>、<code>targetLocales</code> 和
       <code>allLocales</code>。用于使你的配置文件和客户端配置保持同步。</p>
    <p>该路径应以 <code>".js"</code> 或 <code>“.ts”</code>结尾。如果它以 <code>".js"</code> 结尾，它将是
       作为 JavaScript 模块输出。如果它以 <code>".ts"</code> 结尾
       将作为 TypeScript 模块输出。</p>
  </dd>

  <dt class="paramName">interchange.format</dt>
  <dd class="paramDetails">
    <code class="paramType">"xliff" | "xlb"</code>
    <p><em>必填</em></p>
    <p>本地化过程使用的数据格式。选项：
      <ul>
        <li><code>“xliff”</code>：
          <a href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html"
            target="_blank" rel="noopener">XLIFF 1.2</a> XML 格式</li>
        <li><code>“xlb”</code>：Google 内部 XML 格式</li>
      </ul>
    </p>
  </dd>
</dl>

### 运行时模式配置

<dl class="params">
  <dt class="paramName">output.outputDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>必填</em></p>
    <p>生成的模块的输出目录。为每个<code>targetLocale</code>生成的 <code>&lt;locale&gt;.[js|ts]</code> 文件。 每个文件都是一个模块，用于导出
      该语言环境的翻译，使用 message ID 作为 key。</p>
  </dd>

  <dt class="paramName">output.language</dt>
  <dd class="paramDetails">
    <code class="paramType">"js" | "ts"</code>
    <p><em>默认为 <code>"js"</code>，或者，如果
    <code>tsConfig</code> 已指定，则默认为<code>"ts"</code> 。</em></p>
    <p>生成模块的语言。</p>
  </dd>

</dl>

### 转换模式配置

<dl class="params">
   <dt class="paramName">output.outputDir</dt>
   <dd class="paramDetails">
     <code class="paramType">string</code>
     <p><em>除非指定了 <code>tsConfig</code>，否则必填。如果只指定了<code>tsConfig</code>，则默认为<code>tsConfig</code> 的 <code>outDir</code>。 如果两者都指定，则该字段优先。</em></p>
     <p>生成模块的输出目录。在该目录下为每一个语言环境生成一个子目录，每个目录都是该项目在一个语言环境下的完成构建.</p>
   </dd>

</dl>

### XLIFF 模式配置

<dl class="params">
  <dt class="paramName">interchange.xliffDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
     <p><em>如果是<code>"mode": "xliff"</code></em>则必填。</p>
     <p>磁盘上的用于读取/写入 <code>.xlf</code> XML 文件的目录。 对于目标语言环境，将使用 <code><xliffDir>/<locale>.xlf</code> 路径。</p>
  </dd>

  <dt class="paramName">interchange.placeholderStyle</dt>
  <dd class="paramDetails">
    <code class="paramType">"x" | "ph"</code>
     <p><em>默认为 <code>"x"</code></em></p>
     <p>如何表示包含在 HTML 标记和动态表达式的占位符。
     不同的本地化工具和服务对占位符支持不同的语法。</p>
  </dd>
</dl>

### XLB 模式设置

<dl class="params">
  <dt class="paramName">interchange.outputFile</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>如果是<code>"mode": "xlb"</code> 则需要</em</p>
    <p>被创建的 XLB XML 文件的输出路径，这些文件包含从源语言环境文件中提取出的所有 message。
      例如：<code>"data/localization/en.xlb"</code>。</p>
  </dd>

  <dt class="paramName">interchange.translationsGlob</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>如果是<code>"mode": "xlb"</code> 则需要</em</p>
    <p>从磁盘读取的 XLB XML 文件的 <a href="https://github.com/mrmlnc/fast-glob#pattern-syntax"
          target="_blank" rel="noopener">glob</a> 模式，这些文件包含已经翻译好的 message。
          例如： <code>"data/localization/*.xlb"</code>。</p>
  </dd>
</dl>