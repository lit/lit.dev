---
title: 入门套件
eleventyNavigation:
  key: 入门套件
  parent: 工具
  order: 7
versionLinks:
  v1: getting-started/#component-project
---

Lit 入门套件是可重复使用的 Lit 组件的项目模板，可以发布供其他人使用。

要开始在本地使用组件，你可以使用以下启动项目之一：

* [Lit JavaScript 入门项目](https://github.com/lit/lit-element-starter-js)
* [Lit TypeScript 入门项目](https://github.com/lit/lit-element-starter-ts)

这两个项目都定义了一个 Lit 组件。他们还添加了一组用于开发、代码检查和测试组件的可选工具：

* Node.js 和 npm 用于管理依赖项。 _需要 Node.js 10 或更高版本。_
* 本地开发服务器，[Web Dev Server](https://modern-web.dev/docs/dev-server/overview/)。
* 使用 [ESLint](https://eslint.org/) 和 [lit-analyzer](https://www.npmjs.com/package/lit-analyzer) 进行代码检查。
* 使用 [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) 进行测试。
* 使用 [web-component-analyzer](https://www.npmjs.com/package/web-component-analyzer) 和 [eleventy](https://www.11ty.dev/) 构建的静态文档站点。

这些工具都不是 Lit _必需_ 的。它们只是代表了一组可能的工具，可提供良好的开发体验。

<div class="alert alert-info">

**可选的入门方案。** 作为 Lit 官方启动项目的替代方案，Open WC 项目有一个 [项目生成器](https://open-wc.org/docs/development/generator/) 用于在 Web 组件中使用 Lit。 Open WC 脚本会询问一系列问题并为你搭建一个项目。

</div>

### 下载启动项目

在本地试用项目的最快方法是将其中一个启动项目下载为 zip 文件。

1. 从 GitHub 以 zip 文件的形式下载启动项目：

     * [JavaScript 入门项目](https://github.com/lit/lit-element-starter-js/archive/main.zip)
     * [TypeScript 入门项目](https://github.com/lit/lit-element-starter-ts/archive/main.zip)

1. 解压 zip 文件。

1. 安装依赖。

    ```bash
    cd <project folder>
    npm i
    ```

<div class="alert alert-info">

**想在 GitHub 上使用它吗？** 如果你熟悉 git，你可能希望为您的入门项目创建一个 GitHub 仓库，而不仅仅是下载 zip 文件。 那你可以使用 [GitHub 模板仓库](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) 功能基于[JavaScript 入门项目](https://github.com/PolymerLabs/lit-element-starter-js) 或 [TypeScript 入门项目](https://github.com/PolymerLabs/lit-element-starter-ts) 创建自己的存储库。 然后克隆你的新仓库并安装依赖项，如上所述。

</div>

### 试试你的项目

1. **如果你使用的是 TypeScript 版本的启动项目**，需要构建你的项目的 JavaScript 版本：

    ```bash
    npm run build
    ```

    如果想要监视文件并在文件被修改时重建，请在单独的 shell 中运行以下命令：

    ```bash
    npm run build:watch
    ```

     **如果您使用的是 JavaScript 版本启动项目，则不需要构建步骤。**

1.  运行 dev server:

    ```bash
    npm run serve
    ```

1. 在浏览器选项卡中打开项目 demo 页面。 例如：

     [http://localhost:8000/dev/](http://localhost:8000/dev/)

     你的服务器可能使用不同的端口号。 检查终端输出中的 URL 获取正确的端口号。

### 编辑你的组件

编辑您的组件定义。 需要编辑的文件取决于你使用的语言：

* JavaScript。 编辑项目根目录中的 `my-element.js` 文件。
* TypeScript。 编辑 `src` 目录中的 `my-element.ts` 文件。

需要在代码中查看的几样东西：

* 代码为组件定义了一个类（`MyElement`），并将它作为一个名为 `<my-element>` 的自定义元素注册到浏览器中。

    {% switchable-sample %}

    ```ts
    @customElement('my-element')
    export class MyElement extends LitElement { /* ... */ }
    ```

    ```js
    export class MyElement extends LitElement { /* ... */ }

    customElements.define('my-element', MyElement);
    ```

    {% endswitchable-sample %}


* 组件的 `render` 方法定义了一个 [模板]({{baseurl}}/docs/templates/overview/)，它将作为组件的一部分进行渲染。 在这个例子中，它包括一些文本、一些数据绑定和一个按钮。 有关详细信息，请参阅 [模板]({{baseurl}}/docs/templates/overview/)。

    ```js
    export class MyElement extends LitElement {
      // ...
      render() {
        return html`
          <h1>Hello, ${this.name}!</h1>
          <button @click=${this._onClick}>
            Click Count: ${this.count}
          </button>
          <slot></slot>
        `;
      }
    }
    ```

* 组件定义了一些属性。 组件会响应这些属性的变化（例如，必要时重新渲染模板）。 有关详细信息，请参阅 [属性]({{baseurl}}/docs/components/properties/)。

    {% switchable-sample %}

    ```ts
    export class MyElement extends LitElement {
      // ...
      @property({type: String})
      name = 'World';
      //...
    }
    ```

    ```js
    export class MyElement extends LitElement {
      // ...
      static properties = {
        name: {type: String}
      };

      constructor() {
        super();
        this.name = 'World';
      }
      // ...
    }
    ```

    {% endswitchable-sample %}


### 重命名你的组件

你可能希望将组件名称从 “my-element” 更改为更合适的名称。 使用 IDE 或其他文本编辑器最容易做到这一点，它可以让你在整个项目中进行全局搜索和替换。

1. **如果你使用的是 TypeScript 版本**，请删除生成的文件：

    ```bash
    npm run clean
    ```

1. 在项目的所有文件中搜索并用新组件名称替换 “my-element”（`node_modules` 文件夹除外）。
1. 在项目的所有文件中搜索并用新的类名替换 “MyElement”（`node_modules` 文件夹除外）。
1. 重命名源文件和测试文件以匹配新的组件名称：

    JavaScript:

    * `src/my-element.js`
    * `src/test/my-element_test.js`

    TypeScript:

    * `src/my-element.ts`
    * `src/test/my-element_test.ts`

1. **如果你使用的是 TypeScript 版本**，请重建项目：

    ```bash
    npm run build
    ```

1. 测试并确保你的组件仍能工作：

    ```bash
    npm run serve
    ```

### 下一步

准备好为您的组件添加功能了吗？ 前往 [组件]({{baseurl}}/docs/components/overview/) 了解如何构建您的第一个 Lit 组件，或前往 [模板]({{baseurl}}/docs/templates/overview/) 了解有关编写模板的详细信息。

有关运行测试和使用其他工具的详细信息，请参阅启动项目 README：

* [TypeScript 项目 README](https://github.com/PolymerLabs/lit-element-starter-ts/blob/master/README.md)
* [JavaScript 项目 README](https://github.com/PolymerLabs/lit-element-starter-js/blob/master/README.md)

有关将组件发布到 `npm` 的指南，请参阅 [发布]({{baseurl}}/docs/tools/publishing/)。
