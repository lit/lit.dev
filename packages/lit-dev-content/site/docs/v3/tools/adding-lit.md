---
title: Adding Lit to an existing project
eleventyNavigation:
  key: Adding Lit
  parent: Tools
  order: 8
versionLinks:
  v1: tools/use/
  v2: tools/adding-lit/
---

Lit doesn't require any specialized tools, and Lit components work in any JavaScript framework or with any server templating system or CMS, so Lit is ideal for adding to existing projects and applications.

## Install from npm

First, install the `lit` package from npm:

```sh
npm i lit
```

If you are not already using npm to manage JavaScript dependencies, you will have to set up your project first. We recommend the [npm CLI](https://docs.npmjs.com/cli/v7/configuring-npm/install).

## Add a component

You can create a new element anywhere in your project's sources:

_lib/components/my-element.ts_

{% switchable-sample %}

```ts
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

```js
import {LitElement, html} from 'lit';

class MyElement extends LitElement {
  render() {
    return html`
      <div>Hello from MyElement!</div>
    `;
  }
}
customElements.define('my-element', MyElement);
```

{% endswitchable-sample %}

## Use your component

How you use a component depends on your project and the libraries or frameworks it uses. You can use your component in HTML, with DOM APIs, or in template languages:

### Plain HTML
```html
<script type="module" src="/lib/components/my-elements.js">
<my-element></my-element>
```

### JSX

JSX is a very common templating language. In JSX, lower-case element names create HTML elements, which is what Lit components are. Use the tag name you specified in the `@customElement()` decorator:

```tsx
import './components/my-elements.js';

export const App = () => (
  <h1>My App</h1>
  <my-element></my-element>
)
```

### Framework templates

Most JavaScript frameworks have [great support for web components](https://custom-elements-everywhere.com/) and Lit. Just import your element definition and use the element tag names in your templates.

## Next steps

At this point, you should be able to build and run your project and see the "Hello from MyElement!" message.

If you're ready to add features to your component, head over to [Components](/docs/v3/components/overview/) to learn about building your first Lit component, or [Templates](/docs/v3/templates/overview/) for details on writing templates.

For details on building projects, including some sample Rollup configurations, see [Building for production](/docs/v3/tools/production/).
