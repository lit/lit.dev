---
title: 定义组件
eleventyNavigation:
  key: 定义
  parent: 组件
  order: 1
versionLinks:
  v1: components/templates/
---

创建一个继承自`LitElement`的类，然后把这个类注册到浏览器上，就得到了一个Lit组件。

```ts
@customElement('simple-greeting')
export class SimpleGreeting extends LitElement { /* ... */ }
```

`@customElement`装饰器是调用[`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)的一种简写方式，`customElements.define`将一个自定义的元素类注册到浏览器中，并且把这个类和元素名称关联起来（比如：`simple-greeting`）。

如果你在Javascript中使用，或者你在Typescript中使用，但你不喜欢装饰器的话，你也可以直接调用`define()`方法：

```js
export class SimpleGreeting extends LitElement { /* ... */  }
customElements.define('simple-greeting', SimpleGreeting);
```

## Lit组件就是一个HTML元素

当你在定义个Lit组件的时候，其实你就是在定义个一个[自定义HTML元素](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)。因此你可以像使用任何内置元素一样使用这个你自定义的元素：

```html
<simple-greeting name="Markup"></simple-greeting>
```

```js
const greeting = document.createElement('simple-greeting');
```

`LitElement`是Lit组件的一个基类，但同时也是`HTMLElement`的一个子类，因此Lit组件会继承所有标准`HTMLElement`的属性和方法。

需要注意的是，`LitElement`继承自`ReactiveElement`，而`ReactiveElement`继承自`HTMLElement`并实现了相应式属性。

<img alt="继承关系图显示，LitElement继承自ReactiveElement，ReactiveElement继承自HTMLElement。LitElement负责模板化；ReactiveElement负责管理响应式属性和普通属性；HTMLElement是所有原生HTML元素和自定义元素共享的标准DOM接口。" class="centered-image" src="/images/docs/components/lit-element-inheritance.png">

## 提供好的Typescript类型{#typescript-typings}

Typescript可以根据传给特定DOM API的标签名来推断该API返回的HTML元素的类。比如：可以推断出`document.createElement('img')`会返回一个`HTMLImageElement`的实例，且该实例上有一个`src: string`属性。

把自定义元素添加到`HTMLElementTagNameMap`后也可以获得同等的待遇。

```ts
@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number})
  aNumber: number = 5;
  /* ... */
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
```

把自定义元素添加到`HTMLElementTagNameMap`后，下面的代码可以就可以获得正确的类型检查：

```ts
const myElement = document.createElement('my-element');
myElement.aNumber = 10;
```

如果你在使用Typescript，那么我们建议将所有的你所创作组件添加到`HTMLElementTagNameMap`中，并确保npm包中包含`.d.ts`类型文件。
