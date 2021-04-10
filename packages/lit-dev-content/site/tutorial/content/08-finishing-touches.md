As templates get big and complicated, it can help to break them down into smaller pieces. Here we've added a **Hide completed** checkbox to the to-do list. Your mission: refactor the template to hide the completed items when **Hide completed** is checked and show a message when no uncompleted items are displayed.

*   **Calculate the items to display.**

    Add the following at the beginning of the `render()` method:

    ```ts
    const items = this.hideCompleted
      ? this.listItems.filter((item) => !item.completed)
      : this.listItems;
    ```

*   **Define some partial templates.**

    Add the following code directly below the code you just added.

    ```ts
    const list = html`
      <ul>
        ${items.map((item, index) =>
          html`<li data-index=${index}
                class=${classMap({
                  completed: item.completed
                })}
                @click=${() => this.toggleCompleted(item)}>${item.text}
          </li>`
        )}
      </ul>
    `;
    const caughtUpMessage = html`
      <p>
      You're all caught up!
      </p>
    `;
    const listOrMessage = items.length > 0
      ? list
      : caughtUpMessage;
    ```

    You'll notice the `list` template is *almost* indentical to the `<ul>` element in the main template, except that it's using the new `items` local constant instead of `this.listItems`.

*   **Put it all together.**

    In the main template, find the `<ul>` element, and replace the entire
    element, including start and end tags, with the following expression:

    ```js
    ${listOrMessage}
    ```

    The end result should look like this:

    ```ts
    return html`
      <h2>To Do</h2>
      ${listOrMessage}
      <input id="newitem" aria-label="New item">
      ...
    ```

Try clicking **hideCompleted** and make sure your code worked. Go ahead and cross off **Complete Lit tutorial.** (If anything's not working, check your work or click **Solve** to see the finished code.)

If you'd like to keep experimenting with Lit online, you can head over to the [Playground](/playground/). Or if you're ready to try something real, you might want to check out our component [Starter kits](/docs/tools/starter-kits/) or [add Lit to an existing project](/docs/tools/adding-lit/).
