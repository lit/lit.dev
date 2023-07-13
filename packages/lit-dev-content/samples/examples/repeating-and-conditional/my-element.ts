import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  list = ['Peas', 'Carrots', 'Tomatoes'];

  @property()
  condition = true;

  render() {
    return html`
      <p>Render a list:</p>
      <ul>
        ${this.list.map(
          (item, index) =>
            html`
              <li>${index}: ${item}</li>
            `
        )}
      </ul>
    `;
  }
}
