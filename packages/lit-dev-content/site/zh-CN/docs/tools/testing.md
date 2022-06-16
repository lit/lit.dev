---
title: 测试
eleventyNavigation:
  key: 测试
  parent: 工具
  order: 4
versionLinks:
  v1: lit-html/tools/#testing
---

测试可确保你的代码能够按预期运行，并使你免于繁琐的调试。

请参阅 [Starter Kits]({{baseurl}}/docs/tools/starter-kits/) 文档，了解如何使用完全预配置来简单地配置出非常适合测试 Lit 组件的测试环境。

## 选择一个测试框架

Lit 是一个标准的现代 Javascript 库，你几乎可以使用任何 Javascript 测试框架来测试你的 Lit 代码。 这里有很多流行的可选项，包括 [Jest](https://jestjs.io/)、[Karma](https://karma-runner.github.io/)、[Mocha](https://mochajs.org/)、[Jasmine](https://jasmine.github.io/) 和 [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)。

这里有几件事你需要确认清楚，才能确保你的测试环境能有效地测试你的 Lit 代码。

### 在浏览器中测试

Lit 组件是设计在浏览器中运行的，因此应在浏览器环境中进行测试。 专门用于测试 [node](https://nodejs.org/) 代码的工具可能不太适合。

<div class="alert alert-info">
虽然通过 shimming DOM 调用的方式可以在没有浏览器的情况下进行测试，但我们不推荐这种方法，因为它不会以用户体验的方式测试代码。
</div>

### 支持现在 Javascript

你的测试环境必须支持现代 Javascript，包括通过裸模块说明符使用模块，或者适当地降级现代 Javascript。 有关更多详细信息，请参阅文档 [旧版浏览器的要求]({{baseurl}}/docs/tools/requirements/#building-for-legacy-browsers)。

### 使用 polyfill

如果想要在旧版浏览器上进行测试，那么你的测试环境需要加载一些 polyfill，包括 [web components polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) 和 Lit 的 `polyfill-support `模块。 有关详细信息，请参阅文档 [Polyfills]({{baseurl}}/docs/tools/requirements/#polyfills)。
## 使用 Web Test Runner { #web-test-runner }

我们建议使用 [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)，因为它是专门为测试（使用自定义元素和影子 DOM 等现代 Web 功能的）现代 Web 库（如 Lit）而设计的。 请参阅 Web Test Runner 的 [Getting Started](https://modern-web.dev/guides/test-runner/getting-started) 文档。

为了支持较旧的浏览器，你需要配置 Web Test Runner，如下所示：

安装 `@web/dev-server-legacy`:

```bash
npm i @web/dev-server-legacy --save-dev
```

配置  `web-test-runner.config.js`:

```js
import { legacyPlugin } from '@web/dev-server-legacy';

export default {
  /* ... */
  plugins: [
    // 确保这个插件总是放在最后
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        // 将 lit 的 polyfill-support 模块注入到测试文件中，这是与 webcomponents 的 polyfill 交互所必需的
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
  ],
};
```

