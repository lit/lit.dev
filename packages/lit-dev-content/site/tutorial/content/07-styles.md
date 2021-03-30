You can add _encapsulated styles_ to a Lit component.

In this step, we've fleshed out the to-do list component a little bit, adding code to handle completed to-do items. To finish this component, you'll need to add some styles for completed items.

**Add a static `styles` getter to define the encapsulated styles for a component.**

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

**Add classes to your item template (lines 23-24).**

```js
html`<li data-index=${index}
        class=${classMap({completed: item.completed,
            hide: item.completed && this.hideCompleted})}
        @click=${this.toggleCompleted}>${item.text}</li>`)}
```

[`classMap`](/docs/templates/directives/#classmap) is a rendering helper called a *directive*. Here, we're using it to set classes on the list item based on the current state of the component.

<details>
<summary>Learn more: styles</summary>

Styles defined in the static `styles` getter are scoped to the component using shadow DOM. The special `:host` selector lets you style the component itself.

For more information, see [Styles](/docs/components/styles/) and [Working with shadow DOM](/docs/components/shadow-dom/).

</details>

