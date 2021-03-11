---
title: Define a component
eleventyNavigation:
  key: Define
  order: 2
startingSrc: samples/tutorial/create/before/project.json
finishedSrc: samples/tutorial/create/after/project.json
next: tutorial/properties/
prev: tutorial/
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

The `render()` method defines your component's template. You must implement `render()` for every Lit component. The `html` tag function processes a template literal and returns a `TemplateResult`—an object Lit can render.

Your code sample should be working now. Lit components are added to a page with simple HTML tags, like this:

```html
<my-element></my-element>
```

[Next: Reactive properties](/tutorial/properties/)
