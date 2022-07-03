---
title: 运行时本地化模式
eleventyNavigation:
  key: 运行时模式
  parent: 本地化
  order: 2
---

在 Lit Localize 运行时模式下，会为每个语言环境生成一个 JavaScript 或 TypeScript 模块。 每个生成的模块都包含该语言环境的本地化模板。 当你的应用程序切换语言环境时，将导入该语言环境的模块，并重新渲染所有本地化组件。

有关 Lit Localize 输出模式的比较，请参阅 [输出模式]({{baseurl}}/docs/localization/overview/#output-modes)。

#### 输出示例

```js
// locales/es-419.ts
export const templates = {
  h3c44aff2d5f5ef6b: html`Hola <b>Mundo!</b>`,
};
```

## 使用运行时模式的示例

下面示例演示了使用 Lit Localize 运行时模式构建的应用程序：

{% playground-example "docs/libraries/localization/runtime" "x-greeter.ts" %}

Lit GitHub 仓库包含完整的Lit Localize 运行时模式的示例（[JavaScript](https://github.com/lit/lit/tree/main/packages/localize/examples/runtime-js), [TypeScript](https://github.com/lit/lit/tree/main/packages/localize/examples/runtime-ts))，你可以将其用作模板。

## 配置运行时模式

在你的 `lit-localize.json` 配置文件中，将 `output.mode` 属性设置为 `runtime`，并将 `output.outputDir` 属性设置为你希望生成的本地化模板模块存放的位置。 有关详细信息，请参阅 [运行时模式设置]({{baseurl}}/docs/localization/cli-and-config#runtime-mode-settings)。

接下来，将 `output.localeCodesModule` 设置为你指定的文件路径。 Lit Localize 将在指定路径处生成一个 `.js` 或 `.ts` 模块，它将配置文件中的 `sourceLocale` 和 `targetLocales` 复制过来并生成镜像变量导出。 生成的模块将如下所示：

```js
export const sourceLocale = 'en';
export const targetLocales = ['es-419', 'zh-Hans'];
export const allLocales = ['en', 'es-419', 'zh-Hans'];
```

最后，在您的 JavaScript 或 TypeScript 项目中，调用 `configureLocalization`，传递一个具有以下属性的对象：

  - `sourceLocale: string`：由你生成的 `output.localeCodesModule` 模块导出的 `sourceLocale` 变量。

- `targetLocales: string[]`：由你生成的 `output.localeCodesModule` 模块导出的 `targetLocales` 变量。

- `loadLocale: (locale: string) => Promise<LocaleModule>`：加载本地化模板的函数。返回一个 promise，该 promise 会解析出一个为指定语言环境代码声测的本地化模板木块。请参阅 [加载语言环境模块的方法](#approaches-for-loading-locale-modules)，了解你可以在此处使用的函数示例。

`configureLocalization` 返回一个具有以下属性的对象：

- `getLocale`：返回活动语言环境代码的函数。如果正在加载新的语言环境，那么 `getLocale` 将继续返回之前的语言环境代码，直到新的语言环境完成加载。

- `setLocale`：开始将活动语言环境切换到给定代码的函数，并返回一个在新语言环境加载时解析的 promise。
  示例用法：

For example:

例如：

```js
import {configureLocalization} from '@lit/localize';
// 通过 output.localeCodesModule 生成
import {sourceLocale, targetLocales} from './generated/locales.js';

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```

## 自动重新渲染

想要在每次切换活动语言环境时自动触发组件的重新渲染应该怎么做？ 如果使用 JavaScript 编写，需要在的 `constructor` 中调用 `updateWhenLocaleChanges` 函数，或者如果使用 TypeScript 编写，需要使用 `@localized` 装饰器装饰你的类。

{% switchable-sample %}

```ts
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

@localized()
@customElement('my-element');
class MyElement extends LitElement {
  render() {
    // 每当 setLocale() 被调用，并且该语言环境的模板已经完成加载，这个 render() 函数将被重新调用。
    return msg(html`Hello <b>World!</b>`);
  }
}
```

```js
import {LitElement, html} from 'lit';
import {msg, updateWhenLocaleChanges} from '@lit/localize';

class MyElement extends LitElement {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  render() {
    // 每当 setLocale() 被调用，并且该语言环境的模板已经完成加载，这个 render() 函数将被重新调用。
    return msg(html`Hello <b>World!</b>`);
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

## 状态事件

每当切换语言环境开始、完成或失败时，`lit-localize-status` 事件都会在 `window` 上触发。 你可以使用该事件进行：

- 当你不能使用 `@localized` 装饰器时重新渲染（例如，当直接使用 Lit `render` 函数时）。

- 语言环境切换开始后立即渲染，甚至在它加载完成之前（例如加载指示器）。

- 执行其他与本地化相关的任务（例如，设置语言环境偏好 cookie）。

### 事件类型

事件的 `detail.status` 字符串属性告诉你发生了什么样的状态变化，可以是 `loading`、`ready` 或 `error`：

<dl class="params">
  <dt class="paramName">loading</dt>
  <dd class="paramDetails">
    <p>新的语言环境已开始加载。</p>
    <p><code>detail</code> 对象包括：</p>
    <ul>
      <li><code>loadingLocale: string</code>：已开始加载的语言环境代码。</li>
    </ul>
    <p>如果在第一个语言环境完成加载之前就请求第二个语言环境，则会分发一个新的 <code>loading</code> 事件，并且不会为第一个请求分发<code>ready</code> 或 <code>error</code> 事件。</p>
    <p><code>loading</code> 状态后可以跟 <code>ready</code>，
    <code>error</code>，或 <code>loading</code> 状态。</p>
  </dd>

  <dt class="paramName">ready</dt>
  <dd class="paramDetails">
    <p>新的语言环境已成功加载并准备好呈现。</p>
    <p><code>detail</code> 对象包括：</p>
    <ul>
      <li><code>readyLocale: string</code>：已成功加载的语言环境代码。</li>
    </ul>
    <p><code>ready</code> 状态后只能跟随 <code>loading</code> 状态。</p>
  </dd>

  <dt class="paramName">error</dt>
  <dd class="paramDetails">
    <p>新的语言环境加载失败。</p>
    <p><code>detail</code> 对象包括：</p>
    <ul>
      <li><code>errorLocale: string</code>：加载失败的语言环境代码。</li>
      <li><code>errorMessage: string</code>: 来自语言环境加载失败的错误消息。</li>
    </ul>
    <p><code>error</code> 状态后只能跟随 <code>loading</code> 状态。</p>
  </dd>
</dl>

### 使用事件状态的示例

```ts
// 每当加载新语言环境时显示/隐藏进度指示器，并在每次成功加载新语言环境时重新渲染应用程序。
window.addEventListener('lit-localize-status', (event) => {
  const spinner = document.querySelector('#spinner');

  if (event.detail.status === 'loading') {
    console.log(`Loading new locale: ${event.detail.loadingLocale}`);
    spinner.removeAttribute('hidden');
  } else if (event.detail.status === 'ready') {
    console.log(`Loaded new locale: ${event.detail.readyLocale}`);
    spinner.setAttribute('hidden', '');
    renderApplication();
  } else if (event.detail.status === 'error') {
    console.error(
      `Error loading locale ${event.detail.errorLocale}: ` +
        event.detail.errorMessage
    );
    spinner.setAttribute('hidden', '');
  }
});
```

## 加载语言环境模块的方法

Lit Localize 允许你加载任何你喜欢的语言环境模块，因为你可以将任何函数作为 `loadLocale` 选项传递。 以下是一些常见的模式：

### 延迟加载

使用 [动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) 仅在语言环境被激活时加载它。 这是一个很好的默认设置，因为它可以最大限度地减少用户下载和执行的代码量。

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocales, targetLocales} from './generated/locales.js';

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`/locales/${locale}.js`),
});
```

### 预加载

页面加载时开始预加载所有语言环境。 仍然使用动态导入的方式来确保在获取语言环境模块时页面上的剩余脚本不会被阻塞。

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocales, targetLocales} from './generated/locales.js';

const localizedTemplates = new Map(
  targetLocales.map((locale) => [locale, import(`/locales/${locale}.js`)])
);

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => locales.get(locale),
});
```

### 静态导入

使用 [静态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 以阻止页面上其他脚本的方式预加载所有语言环境。

<div class="alert alert-warning">

这种方法通常不被推荐，因为它会导致在页面上的其余脚本可以执行之前获取和执行更多额外的代码，从而阻塞交互性。 仅当你的应用程序非常小，必须打包在单个 JavaScript 文件中，或者你有一些其他原因限制使用动态导入时，才使用此方法。

</div>

```js
import {configureLocalization} from '@lit/localize';
import {sourceLocales, targetLocales} from './generated/locales.js';

import * as templates_es_419 from './locales/es-419.js';
import * as templates_zh_hans from './locales/zh-Hans.js';
...

const localizedTemplates = new Map(
  ['es-419', templates_es_419],
  ['zh-Hans', templates_zh_hans],
  ...
);

const {getLocale, setLocale} = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => locales.get(locale),
});
```
