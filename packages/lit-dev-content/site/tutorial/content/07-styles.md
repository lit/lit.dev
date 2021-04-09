You can add _encapsulated styles_ to a Lit component. Here the starting code is carried over from last step, but we've added the ability to mark an item as completed by clicking on it.

In this step you'll add some styles for completed items.

*   **Add a static `styles` getter.**

    ```js
    static get styles() {
      return css`
        .completed {
          text-decoration-line: line-through;
          color: #777;
        }
      `;
    }
    ```

    Styles defined in the static `styles` getter are scoped to the component using shadow DOM. For more information, see [Styles](/docs/components/styles/) and [Working with shadow DOM](/docs/components/shadow-dom/).

*   **Add classes to your item template**

    Replace the existing line, `class="TODO"` with the following expression:

    ```js
    class=${classMap({
      completed: item.completed
    })}
    ```

    [`classMap`](/docs/templates/directives/#classmap) is a rendering helper called a *directive*. Here, we're using it to set a class on the list item based on the current state of the component. You don't necessarily need `classMap` to set a single class. You could use a ternary like this:

    ```
    class=${item.completed ? 'completed' : undefined}
    ```

    


