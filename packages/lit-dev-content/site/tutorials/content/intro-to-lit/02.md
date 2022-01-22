Lit components can have _reactive properties_. Changing a reactive property triggers the component to update.

Here we've given you a basic component definition. In this step you'll declare a reactive property and use it in an _expression_ in the component's template.

*   **Declare a reactive property.**

    Add the following field to the `MyElement` class:

    {% switchable-sample %}

    ```ts
    @property()
    message: string = 'Hello again.';
    ```

    ```js
    static properties = {
      message: {},
    };

    constructor() {
      super();
      this.message = 'Hello again.';
    }
    ```

    {% endswitchable-sample %}

    The code snippet above adds a string property called `message` to your element class. The `@property` decorator identifies it as a reactive property.

*   **Add an expression to your template.**

    Find the paragraph tag in the `render()` method and replace its contents with this expression:

    ```js
    ${this.message}
    ````

    You can add dynamic values to your Lit templates with JavaScript expressions.

Now you should see the property value in your output.

To see how a reactive property works in practice, you'll need a way to update the value. In the next step, you'll add an event listener to do just that.
