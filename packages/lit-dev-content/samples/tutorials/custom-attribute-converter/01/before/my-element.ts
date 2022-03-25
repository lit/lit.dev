import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({attribute: false})
  date = new Date();

  render() {
    return html`
      <p>The given date is: ${this.date.toLocaleDateString()}</p>
    `;
  }
}