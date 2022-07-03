---
title: 装饰器
eleventyNavigation:
  key: 装饰器
  parent: 组件
  order: 8
versionLinks:
  v1: components/decorators/
---

装饰器是可以修改类、类方法和类字段的行为的特殊函数。 Lit 使用装饰器为诸如注册元素、响应式属性和查询之类的事情提供声明式 API。

装饰器是一个 ECMAScript 标准的 [第二阶段提案](https://github.com/tc39/proposal-decorators)，这意味着它们既没有最终确定也没有在浏览器中实现。 [Babel](https://babeljs.io/) 和 [TypeScript](https://www.typescriptlang.org/) 等编译器，通过将装饰器等提案阶段的功能编译成浏览器可以运行的标准 JavaScript 代码来提供对它们的支持。

请参阅 [启用装饰器](#enabling-decorators) 部分，了解更多信息。

Lit 提供了一组装饰器，可以减少定义组件时需要编写的样板代码量。例如，`@customElement` 和 `@property` 装饰器使基本元素定义更加紧凑：

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property() greeting = "Welcome";
  @property() name = "Sally";
  @property({type: Boolean}) emphatic = true;
  //...
}
```
{#custom-element}

`@customElement` 装饰器定义了一个自定义元素，相当于调用:

```js
customElements.define('my-element', MyElement);
```

`@property` 装饰器声明了一个响应式属性。

有关配置属性的更多信息，请参阅 [响应式属性]({{baseurl}}/docs/components/properties/)。

## 内置装饰器

| 装饰器 | 概括| 详情 |
|-----------|---------|--------------|
| {% api "@customElement" "customElement" %} | 定义一个自定义元素 | [Above](#custom-element) |
| {% api "@eventOptions" "eventOptions" %} | 添加事件监听器选项 | [Events]({{baseurl}}/docs/components/events/#event-options-decorator) |
| {% api "@property" "property" %} | 定义一个公有属性 | [Properties]({{baseurl}}/docs/components/properties/#declare-with-decorators) |
| {% api "@state" "state" %} | 定义一个私有状态属性 | [Properties]({{baseurl}}/docs/components/properties/#declare-with-decorators) |
| {% api "@query" "query" %} | 定义返回组件模板中元素的属性 | [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/#query) |
| {% api "@queryAll" "queryAll" %} | 定义一个属性，该属性返回组件模板中的元素列表 | [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/#query-all) |
| {% api "@queryAsync" "queryAsync" %} | 定义一个属性，该属性返回一个 Promise，该 Promise 将 resolve 组件模板中的一个元素 | [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/#query-async) |
| {% api "@queryAssignedElements" "queryAssignedElements" %} | 定义一个属性，该属性返回分配给特定插槽的子元素 | [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/#query-assigned-nodes) |
| {% api "@queryAssignedNodes" "queryAssignedNodes" %} | 定义返回分配给特定插槽的子节点的属性 | [Shadow DOM]({{baseurl}}/docs/components/shadow-dom/#query-assigned-nodes) |

## 导入装饰器

你可以从 `lit/decorators.js` 模块导入所有 lit 装饰器：

```js
import {customElement, property, eventOptions, query} from 'lit/decorators.js';
```

为了减少运行组件所需的代码量，可以将装饰器单独导入到组件代码中。所有装饰器都可以在 `lit/decorators/<decorator-name>` 找到。例如，

```js
import {customElement} from 'lit/decorators/custom-element.js';
import {eventOptions} from 'lit/decorators/event-options.js';
```

## 启用装饰器 { #enabling-decorators }

你需要通过 [TypeScript](#decorators-typescript) 或 [Babel](#decorators-babel) 等编译器构建代码才能使用装饰器。

未来，当装饰器成为原生 Web 平台功能时，才可能不再需要编译。

### 在 Typescript 中使用装饰器 { #decorators-typescript }

要在 [TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html) 中使用装饰器，需要启用 `experimentalDecorators` 编译器选项。

你还应该确保 `useDefineForClassFields` 设置为 `false`。请注意，虽然仅当 `target` 设置为 `esnext` 或更高时才需要这样做，但建议明确确保该项设置为 `false`。

```json
"experimentalDecorators": true,
"useDefineForClassFields": false,
```

不需要也不推荐启用 `emitDecoratorMetadata`。

### 在 Babel 中使用装饰器  { #decorators-babel }

如果你使用 [Babel](https://babeljs.io/docs/en/) 编译 JavaScript，你可以通过添加以下插件和设置来启用装饰器：

*   [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)
*   [`@babel/plugin-proposal-class-properties`](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

注意，最新版本的 Babel 可能不再需要`@babel/plugin-proposal-class-properties`。

要设置插件，请将如下代码添加到你的 Babel 配置中：

```js
assumptions = {
  "setPublicClassFields": true
};

plugins = [
  ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}],
  ["@babel/plugin-proposal-class-properties"],
];
```

<div class="alert alert-info">

目前不支持旧的 Babel 装饰器的 `legacy` 模式，但这可能会随着 Babel 的发展而改变。如果你想进行实验，请参阅 [Babel 文档](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#legacy)。

</div>

### 在 TypeScript 和 Babel 中使用装饰器

将 TypeScript 与 Babel 一起使用时，一定要把 Babel 配置中的 TypeScript 转换放在装饰器转换之前，如下所示：

```js
{
  "assumptions": {
    "setPublicClassFields": true
  },
  "plugins":[
    ["@babel/plugin-transform-typescript", {"allowDeclareFields": true}],
    ["@babel/plugin-proposal-decorators", {"decoratorsBeforeExport": true}],
    ["@babel/plugin-proposal-class-properties"],
  ]
}
```

`allowDeclareFields` 设置通常是不需要的，但如果想在不使用装饰器的情况下定义响应式属性的话，那么它会很有用。例如，

```ts
static properties = { foo: {} };

declare foo: string;

constructor() {
  super();
  this.foo = 'bar';
}
```

### 避免类字段和装饰器的一些问题 {#avoiding-issues-with-class-fields}

[类字段](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes/Public_class_fields) 与声明响应式属性的交互存在问题。有关详细信息，请参阅[在声明属性时避免类字段出现问题]({{baseurl}}/docs/components/properties/#avoiding-issues-with-class-fields)。

当前的 [第三阶段提案](https://github.com/tc39/proposal-decorators) 中并没有直接解决装饰器的这个问题，但随着提案的发展和成熟，应该会解决这个问题。

使用装饰器时，必须正确配置 Babel 和 TypeScript 的转译器设置，如上述 [TypeScript](#decorators-typescript) 和 [Babel](#decorators-babel) 部分所示。