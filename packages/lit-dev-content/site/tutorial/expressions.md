---
title: More expressions
eleventyNavigation:
  key: More expressions
  order: 4
startingSrc: samples/try/expressions/before/project.json
finishedSrc: samples/try/expressions/after/project.json
---

On the previous pages you used expressions to add text content (child nodes) and add an event listener. You can also use expressions to set attributes or properties:

```js
<!-- Attribute -->
<div class=${this.myTheme}></div>
<!-- Boolean attribute -->
<p ?hidden=${this.isHidden}>I may be in hiding.</p>
<!-- Property -->
<input .value=${this.value}>
```

In this step you'll add an input element with some bindings.

1. **Add an input element.**

    Add an input element to your component:

    ```html
    <input ?disabled=${!this.checked} .value=${this.text}>
    ```

The `disabled` attribute is toggled when the checkbox state changes, and the `value` property is set based on the component's `text` property.

For more information, see [Expressions](/guide/templates/expressions/).

[Next: Template logic](/try/template-logic/)
