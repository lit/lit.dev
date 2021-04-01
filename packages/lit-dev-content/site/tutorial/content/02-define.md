In Lit, most things start with defining a _component_. In this step we've provided the boilerplate for a Lit component, but it doesn't display anything yet. In this step, you'll add some internal DOM to the component.

*   **Add the following method to the existing class definition.**

    ```ts
    render() {
      return html`
        <p>Hello world! From my-element</p>
      `;
    }
    ```

    The `render()` method defines your component's template. The `html` tag function processes a template literal and returns a `TemplateResult`—an object Lit can render.

You should see the greeting message in the output.
