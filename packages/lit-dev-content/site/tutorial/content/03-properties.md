Lit components can have _reactive properties_. Changing a reactive property triggers the component to update. In this step you'll declare a reactive property and use it in an _expression_ in the component's template.

1. **Declare a property.**

    In `my-element.ts`, add the following field to the `MyElement` class:

    ```js
    @property()
    message: string = 'Hello world! From my-element';
    ```

    The code snippet above adds a string property called `message` to your element class. The `@property` decorator identifies it as a reactive property.

2. **Add an expression to your template.**

    You can add dynamic values to your Lit templates with JavaScript expressions.

    Replace the existing `render()` method with the following code:

    ```js
    render() {
      return html`
        <p>${this.message}</p>
      `;
    }
    ```

Now you should see the property value in your output. To see how a reactive property works in practice, you'll need a way to update the value. In the next step, you'll add an event handler to do just that.
