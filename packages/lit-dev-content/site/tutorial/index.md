---
title: Introduction
eleventyNavigation:
  key: Introduction
  order: 1
startingSrc: samples/try/create/before/project.json
finishedSrc: samples/try/create/after/project.json
---

In this step, you'll fill in the gaps in the starting code to create an element class with a basic HTML template. The sample already includes the code for defining a Lit component, but it doesn't render anything yet.

In `my-element.js`, replace the existing class definition with the following code:

```js
class MyElement extends LitElement {
  render() {
    return html`
      <p>Hello world! From my-element</p>
    `;
  }
}
```

The `render` method defines your component's template. You must implement `render` for every Lit component.

Your code sample should be working now. LitElement components are added to a page with simple HTML tags, like this:

```html
<my-element></my-element>
```

[Next: 2. Properties](properties)
