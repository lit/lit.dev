You can add _encapsulated styles_ to a Lit component.

In this step, we've fleshed out the to-do list component a little bit, adding code to handle completed to-do items. To finish this component, you'll need to add some styles for completed items.

*   **Add a static `styles` getter.**

    ```js
    static get styles() {
      return css`
        :host {
          font-weight: bold;
        }
        .completed {
          text-decoration-line: line-through;
        }
        .hide {
          display: none;
        }
      `;
    }
    ```

    Styles defined in the static `styles` getter are scoped to the component using shadow DOM. The special `:host` selector lets you style the component itself. For more information, see [Styles](/docs/components/styles/) and [Working with shadow DOM](/docs/components/shadow-dom/).

*   **Add classes to your item template**

    Replace the existing line, `class="TODO"` with the following expression:

    ```js
    class=${classMap({
      completed: item.completed,
      hide: item.completed && this.hideCompleted
    })}
    ```

    [`classMap`](/docs/templates/directives/#classmap) is a rendering helper called a *directive*. Here, we're using it to set classes on the list item based on the current state of the component.

Now you should be able to mark items completed, so go ahead and cross off **Complete Lit tutorial.**

If you'd like to keep experimenting with Lit online, you can head over to the [Playground](/playground/). Or if you're ready to try something real, you might want to check out our component [Starter kits](TODO_HREF) or [add Lit to an existing project](TODO_HREF).
