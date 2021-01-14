---
title: Fundamentals
eleventyNavigation:
  key: Fundamentals
  parent: Components
  order: 1
---

{% todo %}

TODO: Rework this section. Already in progress in a [separate PR](https://github.com/PolymerLabs/lit.dev/pull/25).

{% endtodo %}

A LitElement component definition is a class that extends from the `LitElement` base class.

A complete component defintion typically consists of a few parts:
 * Class declaration and any mixins
 * Property declarations
 * A render() method with a template
 * Styles
 * Lifecycle callbacks
 * Event handlers

```js
import { LitElement, css, html, property, customElement } from 'lit-element';

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      border: solid 1px blue;
    }
  `;

  // Declare reactive properties
  @property()
  name = 'World';

  // Render the UI as a function of component state
  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
```
