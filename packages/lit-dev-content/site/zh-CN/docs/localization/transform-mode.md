---
title: 转换本地化模式
eleventyNavigation:
  key: 转换模式
  parent: 本地化
  order: 3
---

在 Lit Localize 转换模式下，会为每个语言环境生成一个单独的文件夹。 每个文件夹都是应用程序在一个语言环境中的完整独立构建，并且每个构建都删除了所有 `@lit/localize` 的运行时代码：

- `msg` 函数会被替换为每个语言环境中字符串或模板的静态本地化版本。
- `str` 标签会被移除。
- `@lit/localize` 导入会被移除。
- 模板经过优化，通过尽可能将它们折叠到父模板中来删除不必要的表达式。

例如，给定来源代码：

```js
// src/launch-button.js
import {msg} from '@lit/localize';

render() {
  return html`<button>${msg('Launch rocket')}</button>`
}
```

将生成以下文件：

```js
// locales/en/launch-button.js
render() {
  return html`<button>Launch rocket</button>`
}

// locales/es-419/launch-button.js
render() {
  return html`<button>Lanza cohete</button>`
}
```

## 配置转换模式 {#configuring-transform-mode}

在 `lit-localize.json` 配置文件中，将 `mode` 属性设置为 `transform`，并将 `output.outputDir` 属性设置为你希望生成的本地化应用程序存放的文件夹位置。 有关详细信息，请参阅 [转换模式设置]({{baseurl}}/docs/localization/cli-and-config#transform-mode-settings)。

在 JavaScript 或 TypeScript 项目中，可以选择调用 `configureTransformLocalization`，并传递具有以下属性的对象：

- `sourceLocale: string`：编写源模板的语言环境。 指定为语言环境代码（例如：`"en"`）。 `configureTransformLocalization` 返回具有以下属性的对象：

  - `getLocale`：返回活动语言环境代码的函数。

例如：

```js
import {configureTransformLocalization} from '@lit/localize';

export const {getLocale} = configureTransformLocalization({
  sourceLocale: 'en',
});
```

## 设置初始语言环境 {#setting-the-initial-locale}

在转换模式下，活动语言环境由你加载的 JavaScript 包决定。 当你的页面加载时，如何确定要加载哪个 bundle 包取决于你自己。

例如，如果你的应用程序的语言环境反映在 URL 路径中，你可以在 HTML 文件中加入一个内联脚本，用于检查 URL 并插入适当的 `<script>` 标记：

<div class="alert alert-warning">

动态选择（语言）脚本名称时应始终验证语言环境代码。 下面的示例则是安全的，因为只有与我们已知的语言环境代码之一匹配的脚本才能加载，但如果我们的匹配逻辑不太精确，则可能导致注入不安全 JavaScript 从而引入错误或攻击。

</div>

```js
import {allLocales} from './generated/locales.js';

const url = new URL(window.location.href);
const unsafeLocale = url.searchParams.get('locale');
const locale = allLocales.includes(unsafeLocale) ? unsafeLocale : 'en';

const script = document.createElement('script');
script.type = 'module';
script.src = `/${locale}.js`;
document.head.appendChild(script);
```

为了获得更好的性能，你可以在服务端将适当的脚本标记静态地渲染到 HTML 文件中。 这使得浏览器可以尽可能早地下载脚本。

## 切换语言环境 {#switching-locales}

在转换模式下，`setLocale` 功能不可用。 只有重新加载页面，才可以在下一次加载时选择不同的语言环境 bundle。

例如，每当从下拉列表中选择一个新的语言环境时，这个 `locale-picker` 自定义元素都会加载一个新的 URL：

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {getLocale} from './localization.js';
import {allLocales} from './generated/locales.js';

@customElement('locale-picker');
export class LocalePicker extends LitElement {
  render() {
    return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map(
          (locale) =>
            html`<option value=${locale} selected=${locale === getLocale()}>
              ${locale}
            </option>`
        )}
      </select>
    `;
  }

  localeChanged(event: Event) {
    const newLocale = (event.target as HTMLSelectElement).value;
    const url = new URL(window.location.href);
    if (url.searchParams.get('locale') !== newLocale) {
      url.searchParams.set('locale', newLocale);
      window.location.assign(url.href);
    }
  }
}
```

```js
import {LitElement, html} from 'lit';
import {getLocale} from './localization.js';
import {allLocales} from './generated/locales.js';

export class LocalePicker extends LitElement {
  render() {
    return html`
      <select @change=${this.localeChanged}>
        ${allLocales.map(
          (locale) =>
            html`<option value=${locale} selected=${locale === getLocale()}>
              ${locale}
            </option>`
        )}
      </select>
    `;
  }

  localeChanged(event) {
    const newLocale = event.target.value;
    const url = new URL(window.location.href);
    if (url.searchParams.get('locale') !== newLocale) {
      url.searchParams.set('locale', newLocale);
      window.location.assign(url.href);
    }
  }
}
customElements.define('locale-picker', LocalePicker);
```

{% endswitchable-sample %}

## Rollup 集成 {#rollup-integration}

如果正在使用 <a href="https://rollupjs.org/" target="_blank" rel="noopener">Rollup</a>，并且希望使用集成解决方案而不是单独运行 `lit-localize build` 命。为此，你可以将 `localeTransformers` 函数从 `@lit/localize-tools/lib/rollup.js` 导入到 Rollup 配置中。

此函数生成一个`{locale, transformer}` 对象数组，你可以将其与
<a href="https://www.npmjs.com/package/@rollup/plugin-typescript" target="_blank" rel="noopener">@rollup/plugin-typescript</a> 的  <a href="https://github.com/rollup/plugins/tree/master/packages/typescript/#transformers " target="_blank" rel="noopener">transformers</a> 选项结合使用，为每个语言环境生成一个单独的 bundle。

<div class="alert alert-info">

如果正在使用 JavaScript，不必担心会看到此处使用的 TypeScript 编译器。 虽然 Lit Localize 依赖于 TypeScript 编译器来解析、分析和转换你的源代码，但它也可以处理纯 JavaScript 文件！

</div>

以下 `rollup.config.mjs` 为你的每个语言环境生成一个压缩的 bundle 并保存到 `./bundled/<locale>/` 目录中：

{% switchable-sample %}

```ts
import typescript from '@rollup/plugin-typescript';
import {localeTransformers} from '@lit/localize-tools/lib/rollup.js';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

// 默认从 ./lit-localize.json 读取配置。 如果传入路径，将从别的位置读取。
const locales = localeTransformers();

export default locales.map(({locale, localeTransformer}) => ({
  input: `src/index.ts`,
  plugins: [
    typescript({
      transformers: {
        before: [localeTransformer],
      },
    }),
    resolve(),
    terser(),
  ],
  output: {
    file: `bundled/${locale}/index.js`,
    format: 'es',
  },
}));
```

```js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import summary from 'rollup-plugin-summary';
import {localeTransformers} from '@lit/localize-tools/lib/rollup.js';

// 默认从 ./lit-localize.json 读取配置。 如果传入路径，将从别的位置读取。

const locales = localeTransformers();

export default locales.map(({locale, localeTransformer}) => ({
  input: `src/index.js`,
  plugins: [
    typescript({
      transformers: {
        before: [localeTransformer],
      },
      // 指定要输出的 ES 版本和模块格式。 见 https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
      tsconfig: 'jsconfig.json',
      // 在 Rollup 打包它们之前，把转换后的模块输出到临时目录中。
      outDir: 'bundled/temp',
      // @rollup/plugin-typescript 总是只匹配 ".ts" 文件并且忽略 jsconfig.json 中的所有设置。
      include: ['src/**/*.js'],
    }),
    resolve(),
    terser(),
    summary({
      showMinifiedSize: false,
    }),
  ],
  output: {
    file: `bundled/${locale}/index.js`,
    format: 'es',
    sourcemap: true,
  },
}));
```

{% endswitchable-sample %}
