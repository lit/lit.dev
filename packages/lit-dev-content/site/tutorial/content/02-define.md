In Lit, most things start with defining a _component_. Here we've given you a starter project that has the required imports and nothing else.


*   **Define a component.**

    {% switchable-sample %}

    ```ts
    @customElement('my-element')
    class MyElement extends LitElement {
    }
    ```

    ```js
    class MyElement extends LitElement {
    }
    customElements.define('my-element', MyElement);
    ```

    {% endswitchable-sample %}

    The `MyElement` class provides the implementation for your new component, and the `@customElement` decorator registers it with the browser as a new element type named `my-element`.

    The "TODO" text should disappear from the **Result** pane, showing that the component is defined. But your component is still missing something—it doesn't display anything.

*   **Add a `render()` method to your class.**

    ```ts
    render() {
      return html`
        <p>Hello world! From my-element.</p>
      `;
    }
    ```

    The `render()` method defines your component's internal DOM. The `html` tag function processes a template literal and returns a `TemplateResult`—an object that describes the HTML for Lit to render. Every Lit component should include a `render()` method.

You should see the greeting message in the **Result** pane.
