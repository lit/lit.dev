import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('id-card')
export class IdCard extends LitElement {
  @property() name = '';
  @property({ type: Number }) age = 0;
  @property({ type: Boolean }) programmer = false;

  render() {
    return html`
      <h3>${this.name}</h3>
      <p>Age: ${this.age}</p>
      <label>
        <input disabled type="checkbox" ?checked=${this.programmer}>
        Programmer
      </label>
    `;
  }
}