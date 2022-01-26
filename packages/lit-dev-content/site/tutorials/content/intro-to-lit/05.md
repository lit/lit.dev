Now that you've got some of the basics, we'll introduce a more complicated element. In the remainder of this tutorial, you'll build a to-do list component. Here we've provided some of the boilerplate for your to-do-list.

You can use standard JavaScript in Lit expressions to create conditional or repeating templates. In this step, you'll use `map()` to turn an array of data into a repeating template.

*   **Render list items.**

    Add the following expression between the start and end tags for the unordered list (`<ul>`).

    ```html
      ${this.listItems.map((item) =>
        html`<li>${item.text}</li>`
      )}
    ```

    Note the nested `html` inside the `map()` callback. For more information, see [Lists and repeating templates](/docs/templates/lists/).

*   **Add the click handler.**

    We've provided an input and an **Add** button, but they aren't hooked up yet. Add the `input` property and an event handler method for the button:


    {% switchable-sample %}

    ```ts
    @query('#newitem')
    input!: HTMLInputElement;

    addToDo() {
      this.listItems.push({text: this.input.value, completed: false});
      this.input.value = '';
      this.requestUpdate();
    }
    ```

    ```js
    get input() {
      return this.renderRoot?.querySelector('#newitem') ?? null;
    }

    addToDo() {
      this.listItems.push({text: this.input.value, completed: false});
      this.input.value = '';
      this.requestUpdate();
    }
    ```

    {% endswitchable-sample %}

    As the name suggests, `requestUpdate()` triggers the component to update. Setting a reactive property calls this automatically. Since you're not setting `listItems` here, but only mutating the array, you need to call `requestUpdate()` yourself.

    The `@query` decorator is a handy way of getting a reference to a node in your component's internal DOM. It's basically equivalent to calling code like this in your constructor:

    ```js
    this.input = this.shadowRoot.querySelector('#newitem');
    ```

Try entering a new item and clicking **Add**.

