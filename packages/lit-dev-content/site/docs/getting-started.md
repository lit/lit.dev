---
title: Getting Started
eleventyNavigation:
  key: Getting Started
  parent: Introduction
  order: 3
---

There are many ways to get started using Lit, from our Playground and interactive tutorial to installing into an exising project.

### lit.dev Playground

lit.dev has an interactive Playground and examples to let you try Lit right away with no setup.

* [Hello World (TypeScript)](/playground/#sample=examples/hello-world-typescript)
* [Hello World (JavaScript)](/playground/#sample=examples/hello-world-javascript)

### Interactive Tutorial

Take our [step-by-step tutorial](/tutorial/) to learn how to build a Lit component in minutes.

### Lit Starter Kits

We proide TypeScript and JavaScript component starter kits for creating standalone reusable components. See [Starter Kits](/tools/starter-kits/).

### Adding Lit to a existing project

Lit doesn't require any specialized tools, so you can add it to exisitng projects and applications.

#### Install from npm

```sh
npm i lit
```

#### Add an component

Create a new element, anywhere in your project's source:

_lib/components/my-element.ts_

```js
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  render() {
    return html`
      <div>Hello from MyElement!</div>
    `;
  }
}
```

#### Use your component

How you use a component depends on your project and the libraries or frameworks is uses. You can use your component in HTML, with DOM APIs, or in template languages:

##### Plain HTML:
```html
<script type="module" src="/lib/components/my-elements.js">
<my-element></my-element>
```

##### JSX:

```tsx
import './components/my-elements.js';

export const App = () => (
  <h1>My App</h1>
  <my-element></my-element>
)
```

At this point, you should be able to build and run your project and see the "Hello from MyElement!" message.

For details on building projects, including some sample Rollup configurations, see [Building for production](/docs/tools/production/).

#### Next steps

Ready to add features to your project? Head over to [Components](/docs/components/overview/) to learn about building your first Lit component, or [Templates](/docs/templates/overview/) for details on writing templates.

For more on building applications that use web components, see the Open WC recommendations on [Building](https://open-wc.org/building/).

### Open WC project generator

The Open WC project has a [project generator](https://open-wc.org/init/) that can scaffold out an application project using LitElement.
