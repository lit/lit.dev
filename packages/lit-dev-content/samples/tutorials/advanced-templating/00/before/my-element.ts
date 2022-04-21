import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  name = 'World';

  render() {
    return html`
      <h1>Hello, ${this.name}!</h1>
    `;
  }
}