To add interactivity to your components, you'll probably want to add some event handlers. Lit makes it easy to add a _declarative event handler_ in the template, using an expression like this:

```html
<button @click=${this.handleClick}>Click me!</button>
```

In this step you'll add an input element and an event handler to a component.

1. **Add an input element.**

    Add an input element to your component:

    ```html
    <input @change=${this.changeName} placeholder="Enter your name">
    ```

    <code>@<var>eventName</var></code> is a special syntax for adding an event handler using an expression.

2. **Add the event handler.**

    Next, add the event handler that's called when the input value changes.

    ```ts
    changeName(event: Event) {
      const input = event.target as HTMLInputElement;
      this.name = input.value;
      input.value = '';
    }
    ```

Now try it out!

For more information about declarative event handlers, see [Events](/docs/components/events/).
