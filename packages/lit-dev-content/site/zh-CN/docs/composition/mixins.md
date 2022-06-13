---
title: Mixins
eleventyNavigation:
  parent: 组合
  key: Mixins
  order: 3
---

类混合是一种使用标准 JavaScript 在类之间共享代码的模式。 与像 [响应式控制器](/docs/composition/controllers/) 这样的“有”组合模式（即类可以 _拥有_ 一个控制器来添加行为）相反，mixin 实现的是“是”的组合，其中 mixin 会导致类本身 _是_ 被共享行为的一个实例。

你可以使用 mixin，通过添加 API 或覆盖其生命周期回调来自定义 Lit 组件。

## Mixin 基础

Mixin 可以被认为是“子类工厂”，mixin 覆盖了应用它们的类并返回一个子类，子类扩展了 mixin 中的行为。
因为 mixin 是使用标准 JavaScript 类表达式实现的，所以它们可以使用所有可用于子类化的惯用语，例如添加新字段/方法、覆盖现有父类方法以及使用 `super`。

<div class="alert alert-info">

为了便于阅读，此页面上的示例省略了一些用于 mixin 功能 TypeScript 类型。有关在 TypeScript 中正确键入 mixin 的详细信息，请参阅 [TypeScript 中的 Mixins](#mixins-in-typescript)。

</div>

要定义一个 mixin，需要编写一个函数，该函数接收一个`superClass`，并返回一个扩展它的新类，按需添加字段和方法：

```ts
const MyMixin = (superClass) => class extends superClass {
  /* 用来扩展父类的类字段和方法 */
};
```

要应用 mixin，只需给mixin函数传递一个类，然后就生成应用了 mixin 的子类。最常见的是，用户在定义新类时会将 mixin 直接应用于基类：

```ts
class MyElement extends MyMixin(LitElement) {
  /* 用户代码 */
}
```

Mixin 还可以用于创建具体的子类，然后用户可以像继承普通类一样继承它，其中 mixin 是一些实现细节：

```ts
export const LitElementWithMixin = MyMixin(LitElement);
```

```ts
import {LitElementWithMixin} from './lit-element-with-mixin.js';

class MyElement extends LitElementWithMixin {
  /* 用户代码 */
}
```

因为类 mixin 是标准的 JavaScript 模式而不是 Lit 特有，所以社区中有大量关于利用 mixin 进行代码重用的信息。 有关 mixin 的更多阅读，这里有一些很好的参考资料：

* MDN上的 [类 mixin](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes#mix-ins_%E6%B7%B7%E5%85%A5)
* Justin Fagnani 的 [Real Mixins with JavaScript Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-JavaScript-classes/)
* TypeScript手册的 [Mixins](https://www.TypeScriptlang.org/docs/handbook/mixins.html)。
* open-wc 的 [Dedupe mixin library](https://open-wc.org/docs/development/dedupe-mixin/)，包括讨论何时使用 mixin 可能会导致重复，以及如何使用去重库来避免这种情况。
* Elix Web 组件库的[Mixin 约定](https://component.kitchen/elix/mixins)。 虽然不是特定于 Lit 的，但包含了为 Web 组件定义 mixin 时应用约定的深思熟虑的建议。

## 为 LitElement 定义 mixin

应用于 LitElement 的 mixin 可以实现或覆盖任何标准的 [自定义元素生命周期]({{baseurl}}/docs/components/lifecycle/#custom-element-lifecycle)回调,
比如：`constructor()` 或 `connectedCallback()`，以及任何[响应式更新生命周期](/docs/components/lifecycle/#reactive-update-cycle)回调，比如：`render()` 或 ` 更新（）`。

例如，以下 mixin 将在元素创建，连接和更新时打印日志：

```ts
const LoggingMixin = (superClass) => class extends superClass {
  constructor() {
    super();
    console.log(`${this.localName} was created`);
  }
  connectedCallback() {
    super.connectedCallback();
    console.log(`${this.localName} was connected`);
  }
  updated(changedProperties) {
    super.updated?.(changedProperties);
    console.log(`${this.localName} was updated`);
  }
}
```

请注意，mixin 应始终对“LitElement”实现的标准自定义元素生命周期方法进行父类调用。当覆盖响应式更新生命周期回调时，如果父类中已经存在 super 方法，则调用它是一种很好的做法（如上所示，对 `super.updated?.()` 进行可选链调用）。

另请注意，mixin 可以通过选择何时进行父类调用来选择在标准生命周期回调的基本实现之前或之后进行工作。

Mixin 还可以将 [响应式属性]({{baseurl}}/docs/components/properties/)、[样式]({{baseurl}}/docs/components/styles/) 和 API 添加到子类元素。

下面示例中的 mixin 为元素添加了一个 `highlight` 响应式属性和一个`renderHighlight()` 方法，用户可以调用该方法来包装一些内容。 设置 `highlight` property/attribute时，包装内容的样式为黄色。

{% playground-ide "docs/mixins/highlightable/" "highlightable.ts" %}

请注意，在上面的示例中，mixin 的用户应该从他们的 `render()` 方法中调用 `renderHighlight()` 方法，并注意将 mixin 定义的`静态样式`添加到子类样式中。 mixin 和用户之间的这种约定的性质取决于 mixin 的定义，并且应该由 mixin 的作者给出文档。

## TypeScript 中的 Mixin

在用 TypeScript 中编写 `LitElement` mixin 时，有一些细节需要注意到。

### 编写父类

你应该将 `superClass` 参数限制为你希望用户继承的类的类型（如果有的话）。 可以使用通用的 `Constructor` 辅助类型来完成限制，如下所示：

```ts
import {LitElement} from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    /* ... */
  };
  return MyMixinClass as /* 参考下面的“编写子类” */;
}
```

上面的示例确保传递给 mixin 的类是从 `LitElement` 继承而来的，因此你的 mixin 可以依赖于 Lit 提供的回调和其他 API。

### 编写子类

尽管 TypeScript 基本能够推断使用 mixin 模式生成的子类的返回类型，但它有一个严重的限制，即推断的类不能包含具有 `private` 或 `protected` 访问修饰符的成员。

<div class="alert alert-info">

因为 `LitElement` 本身确实包含 private 和 protected 成员，所以默认情况下，当返回一个继承自 `LitElement` 的类时 TypeScript 会报错 _"Property '...' of exported class expression may not be private or protected."_。

</div>

有两种解决方法可以避免上述错误，两者都涉及转换从 mixin 函数返回类型。

#### 当 mixin 不会新增 public/protected API 时

如果你的 mixin 只覆盖 `LitElement` 方法或属性并且没有新增任何自己的 API，则可以简单地将生成的类转换为传入的父类类型 `T`：

```ts
export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    connectedCallback() {
      super.connectedCallback();
      this.doSomethingPrivate();
    }
    private doSomethingPrivate() {
      /* 不需要是接口的一部分 */
    }
  };
  // 转换类型为传入的父类类型
  return MyMixinClass as T;
}
```

#### 当 mixin 新增 public/protected API 时

如果你的 mixin 添加了新的 proected 或 public API（你需要用户能够在其类上使用），则需要将 mixin 的接口与实现分开定义，并将返回类型转换为 mixin 接口和父类类型的交集：

```ts
// 为 mixin 定义接口
export declare class MyMixinInterface {
  highlight: boolean;
  protected renderHighlight(): unknown;
}

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    @property() highlight = false;
    protected renderHighlight() {
      /* ... */
    }
  };
  // 将返回类型转换为父类类型与 mixin 接口的交集
  return MyMixinClass as Constructor<MyMixinInterface> & T;
}
```

### 在 mixin 中使用指令

由于 TypeScript 类型系统的限制，装饰器（如 `@property()`) 必须应用于类声明语句而不是类表达式。

在实践中，这就意味着 TypeScript 中的 mixin 需要声明一个类，然后返回它，而不是直接从箭头函数返回一个类表达式。

支持：
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  // ✅ 在函数体中定义一个类，然后返回它
  class MyMixinClass extends superClass {
    @property()
    mode = 'on';
    /* ... */
  };
  return MyMixinClass;
}
```

Not supported:
```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) =>
  // ❌ 使用箭头函数简写方式直接返回类表达式
  class extends superClass {
    @property()
    mode = 'on';
    /* ... */
  }
```
