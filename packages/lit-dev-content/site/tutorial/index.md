---
title: Define a component
eleventyNavigation:
  key: Define
  order: 1
startingSrc: samples/try/create/before/project.json
finishedSrc: samples/try/create/after/project.json
---

In Lit, most things start with defining a component. Complete this component definition by adding a `render()` method that defines the component's internal DOM.

In `my-element.ts`, replace the existing class definition with the following code:

```ts
class MyElement extends LitElement {
  render() {
    return html`
      <p>Hello world! From my-element</p>
    `;
  }
}
```

The `render()` method defines your component's template. You must implement `render()` for every Lit component.

Your code sample should be working now. Lit components are added to a page with simple HTML tags, like this:

```html
<my-element></my-element>
```

[Next: Reactive properties](properties)
