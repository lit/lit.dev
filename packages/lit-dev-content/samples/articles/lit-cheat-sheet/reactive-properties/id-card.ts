import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('id-card')
export class IdCard extends LitElement {
  // Default attribute converter is string
  @property() name = '';
  // Number attribute converter converts attribtues to numbers
  @property({ type: Number }) age = 0;
  // Boolean attribute converter converts attribtues to boolean using
  // .hasAttribute(). NOTE: boolean-attribute="false" will result in `true`
  @property({ type: Boolean }) programmer = false;
  // You can also specify the attribute name
  @property({ type: Boolean, attribute: 'is-cool' }) isCool = false;

  render() {
    return html`
      <h3>${this.name}</h3>
      <p>Age: ${this.age}</p>
      <label style="display: block;">
        <input disabled type="checkbox" ?checked=${this.programmer}>
        Programmer
      </label>
      <label>
        <input disabled type="checkbox" ?checked=${this.isCool}>
        Is Cool
      </label>
    `;
  }
}