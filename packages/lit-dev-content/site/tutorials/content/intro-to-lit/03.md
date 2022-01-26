To add interactivity to your components, you'll probably want to add some event handlers. Lit makes it easy to add a _declarative_ event listener in the template, using an expression like this:

```html
<button @click=${this.handleClick}>Click me!</button>
```

Here we've provided a name tag component with a message and an input element. In this step you'll use a declarative event listener so the component can handle input events.

*   **Add a declarative event listener.**

    Find the input element and add this expression inside the tag:

    ```html
    @input=${this.changeName}
    ```

    <code>@<var>eventName</var></code> is a special syntax for adding an event handler using an expression.

*   **Add the event handler method.**

    Next, add the event handler that's called when the input value changes.


    {% switchable-sample %}

    ```ts
    changeName(event: Event) {
      const input = event.target as HTMLInputElement;
      this.name = input.value;
    }
    ```

    ```js
    changeName(event) {
      const input = event.target;
      this.name = input.value;
    }
    ```

    {% endswitchable-sample %}

    Since `name` is a reactive property, setting it in the event handler triggers the component to update.

Try it out by entering a name.

For more information about declarative event handlers, see [Events](/docs/components/events/).
