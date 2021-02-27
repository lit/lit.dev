---
title: More expressions
eleventyNavigation:
  key: More expressions
  order: 4
startingSrc: samples/try/expressions/before/project.json
finishedSrc: samples/try/expressions/after/project.json
---

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

2. **Add the event handler.**

    Next, add the event handler that's called when the input value changes.

    ```ts
    changeName(event: Event) {
      const input = event.target as HTMLInputElement;
      this.name = input.value;
      input.value = '';
    }
    ```

[Next: More expressions](expressions)
