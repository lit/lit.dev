import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('name-tag')
export class NameTag extends LitElement {
  @property()
  name: string = 'Your name here';

  render() {
    // TODO: Add declarative event listener to input.
    return html`
      <p>Hello, ${this.name}</p>
      <input placeholder="Enter your name">
    `;
  }

  // TODO: Add event handler method.
}
