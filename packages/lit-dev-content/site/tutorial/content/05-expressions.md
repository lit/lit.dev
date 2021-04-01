On the previous pages you used expressions to add text content (child nodes) and add an event listener. You can also use expressions to set attributes or properties.


*   **Add an input element to your component.**

    ```html
    <input ?disabled=${!this.checked} .value=${this.text}>
    ```

    The `disabled` attribute is toggled when the checkbox state changes, and the `value` property is set based on the component's `text` property.


Here are the most common places to use expressions:

```html
<!-- Child nodes -->
<h1>${this.pageTitle}</h1>
<!-- Attribute -->
<div class=${this.myTheme}></div>
<!-- Boolean attribute -->
<p ?hidden=${this.isHidden}>I may be in hiding.</p>
<!-- Property -->
<input .value=${this.value}>
```

Expressions can use any standard JavaScript.

For more information, see [Expressions](/docs/templates/expressions/).

