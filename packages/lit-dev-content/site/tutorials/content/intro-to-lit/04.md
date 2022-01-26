On the previous pages you used expressions to add text content (child nodes) and add an event listener. You can also use expressions to set attributes or properties.

Here we've provided a component with a checkbox and a text input. In this step you'll use an expression to enable or disable the text input.

*   **Find the text input and add this expression.**

    ```html
    ?disabled=${!this.checked}
    ```

    The <code>?<var>attributeName</var></code> syntax tells Lit you want to set or remove a boolean attribute based on the value of the expression.

There are five common positions for expressions in Lit templates:

```html
<!-- Child nodes -->
<h1>${this.pageTitle}</h1>

<!-- Attribute -->
<div class=${this.myTheme}></div>

<!-- Boolean attribute -->
<p ?hidden=${this.isHidden}>I may be in hiding.</p>

<!-- Property -->
<input .value=${this.value}>

<!-- Event listener -->
<button @click=${() => {console.log("You clicked a button.")}}>...</button>
```

Expressions can use any standard JavaScript.

For more information, see [Expressions](/docs/templates/expressions/).

