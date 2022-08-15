---
title: 构建生产
eleventyNavigation:
  key: 生产
  parent: 工具
  order: 6
versionLinks:
  v1: tools/build/
---

本页重点介绍构建使用 Lit 组件进行生产的应用程序的建议。 在将可重用的 Lit _组件_ 发布到 npm 之前对源代码执行的构建步骤的建议，请参阅 [发布]({{baseurl}}/docs/tools/publishing/)。

在构建包含 Lit 组件的应用程序时，可以使用常见的 JavaScript 构建工具来准备源代码和依赖项，以便在生产环境中提供服务，例如 [Rollup](https://rollupjs.org/) 或 [webpack](https://webpack.js.org/) 。

请参阅 [要求](/docs/tools/requirements/) 了解构建 Lit 代码的完整要求列表，这些要求同时适用于开发和生产。

除了这些最低要求外，本页还介绍了在为生产准备代码时应考虑的优化，以及实现它们的具体 Rollup 配置。

## 为生产准备代码 {#preparing-code-for-production}

Lit 项目受益于与其他 Web 项目相同的构建时优化。在生产环境中为 Lit 应用程序提供服务时，建议进行以下优化：

* 通过打包 Javascript 模块来减少网络请求（例如，使用 [Rollup](https://rollupjs.org/) 或 [webpack](https://webpack.js.org/)）。
* 通过压缩 Javascript 代码来获得更小的包大小（[Terser](https://www.npmjs.com/package/terser) 非常适合 Lit，因为它支持现代 JavaScript）。
* [为现代浏览器提供现代代码](https://web.dev/serve-modern-code-to-modern-browsers/)，因为它通常更小更快，并且是可以回退到旧浏览器上的编译代码。
* [hash静态资源管理，包括打包的 JavaScript](https://web.dev/love-your-cache/#fingerprinted-urls) 以便于缓存失效。
* [启用服务时压缩](https://web.dev/reduce-network-payloads-using-text-compression/#data-compression)（例如 gzip 或 brotli）在传输时减少字节。

此外，请注意，由于 Lit 模板是在 JavaScript 模板字符串字面量中定义的，因此它们不会被标准 HTML 压缩器处理。通过添加一个插件来压缩模板字符串文字中的 HTML，可以适度减少代码大小。下面几个包可用于执行此优化：

* Rollup：[rollup-plugin-minify-html-literals](https://www.npmjs.com/package/rollup-plugin-minify-html-literals?activeTab=readme)
* Webpack：[minify-template-literal-loader](https://www.npmjs.com/package/minify-template-literal-loader)

## 使用 rollup 构建 {#building-with-rollup}

你可以使用许多工具来执行提供 Lit 代码所需的必需和可选构建步骤，并且 Lit 不需要任何一种特定工具。 但是，我们推荐 Rollup，因为它旨在使用标准 ES 模块格式并利用客户端的原生模块输出最佳代码。

有很多方法可以设置 rollup 来打包项目。 [Modern Web](https://modern-web.dev/) 项目维护了一个出色的 Rollup 插件 [`@web/rollup-plugin-html`](https://modern-web.dev/docs/building/rollup-plugin-html/)，它有助于将许多用于构建应用程序的最佳实践结合到一个易于使用的包中。 使用此插件的示例配置如下所述。

### 仅支持现代浏览器的构建 {#modern-only-build}

下面带注释的 `rollup.config.js` 文件将构建一个满足[现代浏览器构建要求]({{baseurl}}/docs/tools/requirements/#building-for-modern-browsers) 和本页描述的[生产优化](#preparing-code-for-production)。 这个配置适用于无须 polyfill 就可以运行 ES2019 JS 的现代浏览器。

所需的 Node 模块：
```sh
npm i --save-dev rollup \
  @web/rollup-plugin-html \
  @web/rollup-plugin-copy \
  @rollup/plugin-node-resolve \
  rollup-plugin-terser \
  rollup-plugin-minify-html-literals \
  rollup-plugin-summary
```

`rollup.config.js:`
```js
// 导入 rollup 插件
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

export default {
  plugins: [
    // 应用程序构建的入口点； 可以指定一个 glob 来为非 SPA 应用程序构建多个 HTML 文件
    html({
      input: 'index.html',
    }),
    // 将裸模块说明符解析为相对路径
    resolve(),
    // 压缩 HTML 模板文字
    minifyHTML(),
    // 压缩 JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // 打印打包摘要
    summary(),
    // 可选: 将所有静态资产复制到构建目录
    copy({
      patterns: ['images/**/*'],
    }),
  ],
  output: {
    dir: 'build',
  },
  preserveEntrySignatures: 'strict',
};
```

运行 rollup 构建:
```sh
rollup -c
```

### 支持现代 + 旧版浏览器的构建 {#modern-+-legacy-build}

以下配置是生成包含两组 JS 包的混合构建，一组用于现代浏览器，一组用于旧版浏览器。 现代包会被乐观地预取，客户端功能检测用于根据 [旧版浏览器构建要求] 确定是加载更小/更快的现代构建还是旧版构建（以及其他必需的 polyfill）。

Required node modules:
```sh
npm i --save-dev rollup \
  @web/rollup-plugin-html \
  @web/rollup-plugin-polyfills-loader \
  @web/rollup-plugin-copy \
  @rollup/plugin-node-resolve \
  @rollup/plugin-babel \
  rollup-plugin-terser \
  rollup-plugin-minify-html-literals \
  rollup-plugin-summary
```

`rollup.config.js:`
```js
// 导入 rollup 插件
import html from '@web/rollup-plugin-html';
import polyfillsLoader from '@web/rollup-plugin-polyfills-loader';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

// 配置一个 @web/rollup-plugin-html 实例
const htmlPlugin = html({
  rootDir: './',
  flattenOutput: false,
});

export default {
  // 应用程序构建的入口点； 可以指定一个 glob 来为非 SPA 应用程序构建多个 HTML 文件
  input: 'index.html',
  plugins: [
    htmlPlugin,
     // 将裸模块说明符解析为相对路径
    resolve(),
    // 压缩 HTML 模板文字
    minifyHTML(),
    // 压缩 JS
    terser({
      module: true,
      warnings: true,
    }),
    // 注入 polyfill 到 HTML（core-js, regnerator-runtime, webcoponents, lit/polyfill-support）和
    // 动态加载现代和旧版构建 
    polyfillsLoader({
      modernOutput: {
        name: 'modern',
      },
      // 加载旧版包的功能检测
      legacyOutput: {
        name: 'legacy',
        test: '!!Array.prototype.flat',
        type: 'systemjs',
      },
      // 要注入的 polyfill 列表（每个都有单独的特征检测）
      polyfills: {
        hash: true,
        coreJs: true,
        regeneratorRuntime: true,
        fetch: true,
        webcomponents: true,
        // 加载 Lit 的 polyfill-support 模块的自定义配置，需要与 webcomponents 的 polyfill 交互
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype)",
            module: false,
          },
        ],
      },
    }),
    // 打印打包摘要
    summary(),
    // 可选: 将所有静态资产复制到构建目录
    copy({
      patterns: ['data/**/*', 'images/**/*'],
    }),
  ],
  // 指定两个 JS 输出配置，现代和传统，HTML 插件将自动在它们之间进行选择； 
  // 旧版本编译为 ES5 和 SystemJS 模块
  output: [
    {
      // 现代 JS 包 (无须 JS 编译, 直接输出 ES module)
      format: 'esm',
      chunkFileNames: '[name]-[hash].js',
      entryFileNames: '[name]-[hash].js',
      dir: 'build',
      plugins: [htmlPlugin.api.addOutput('modern')],
    },
    {
      // 旧版 JS 包 (编译为 ES5，输出 SystemJS 模块)
      format: 'esm',
      chunkFileNames: 'legacy-[name]-[hash].js',
      entryFileNames: 'legacy-[name]-[hash].js',
      dir: 'build',
      plugins: [
        htmlPlugin.api.addOutput('legacy'),
        // 使用 babel 将 JS 编译为 ES5，将模块编译为 SystemJS
        getBabelOutputPlugin({
          compact: true,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: '11',
                },
                modules: 'systemjs',
              },
            ],
          ],
        }),
      ],
    },
  ],
  preserveEntrySignatures: false,
};
```

## 使用独立的 lit-html 构建 {#building-with-standalone-lit-html}

如果你希望使用 lit-html 作为独立的模板库，你可以遵循几乎所有的使用 Lit 构建的指南。 唯一的区别是单独使用 lit-html 不需要完整的 Web 组件 polyfill。 你只需要模板 polyfill。

### 使用模板 polyfill {#using-the-template-polyfill}

要在不支持 `<template>` 元素的 IE11 上运行 lit-html，你需要一个 polyfill。 你可以使用 Web 组件 polyfill 中包含的模板 polyfill。

安装模板 polyfill：

```bash
npm i @webcomponents/template
```

使用模板 polyfill:

```html
<script src="./node_modules/@webcomponents/template/template.js"></script>
```

注意：为 IE11 编译时，Babel polyfill 需要与应用程序代码分开打包，并在模板 polyfill *之前*加载。
