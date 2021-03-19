You can use standard JavaScript in Lit expressions to create conditional or repeating templates. In this step, you'll use `map()` to turn an array of data into a repeating template.

1. **Add the list items to the template.**

    Replace the TODO comment with the expression shown below:

    ```html
    <ul>
      ${this.listItems.map((item) =>
        html`<li>${item}</li>`
      )}
    <ul>
    ```

Try entering a new item in the input box.

Note the nested `html` inside the `map()` callback. For more information, see [Lists and repeating templates](/guide/templates/lists/).
