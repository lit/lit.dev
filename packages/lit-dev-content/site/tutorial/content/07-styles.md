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

    [`classMap`](/docs/templates/directives/#classmap) is a rendering helper called a *directive*, which provides a quick way to toggle classes on an element. Here you're only using it to set a single class, but using `classMap` lets you add more classes in the future without rewriting this code.

