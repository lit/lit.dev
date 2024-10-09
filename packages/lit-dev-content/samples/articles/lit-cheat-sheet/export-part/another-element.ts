import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('another-element')
export class AnotherElement extends LitElement {
  render() {
    return html`
      <div part="part-1">Part 1</div>
      <div part="part-2">Part 2</div>
    `;
  }
}