In Lit, most things start with defining a _component_. In this step we've provided the boilerplate for a Lit component, but it doesn't display anything yet.

Complete this component definition by adding a `render()` method that defines the component's internal DOM.


**In `my-element.ts`, replace the existing class definition with the following code.**

```ts
class MyElement extends LitElement {
  render() {
    return html`
      <p>Hello world! From my-element</p>
    `;
  }
}
```

You should see the greeting message in the output.

<details>
<summary>Learn more: rendering</summary>

The `render()` method defines your component's template. You must implement `render()` for every Lit component. The `html` tag function processes a template literal and returns a `TemplateResult`—an object Lit can render.

</details>

