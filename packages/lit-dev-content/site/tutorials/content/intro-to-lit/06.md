You can add _encapsulated styles_ to a Lit component. Here the starting code is carried over from last step, but we've added the ability to mark an item as completed by clicking on it.

In this step you'll add some styles for completed items.

*   **Add a static `styles` class field.**

    ```js
    static styles = css`
      .completed {
        text-decoration-line: line-through;
        color: #777;
      }
    `;
    ```

    Styles defined in the static `styles` class field are scoped to the component using shadow DOM. For more information, see [Styles](/docs/components/styles/) and [Working with shadow DOM](/docs/components/shadow-dom/).

*   **Add classes to your item template**

    Replace the existing line, `class="TODO"` with the following expression:

    ```js
    class=${item.completed ? 'completed' : ''}
    ```

    A ternary expression is a handy way of adding conditional logic to a template. If you want to set more than one class at a time, you can use Lit's
    [`classMap`](/docs/templates/directives/#classmap) directive, instead.
