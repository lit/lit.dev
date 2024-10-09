import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('another-component')
export class AnotherComponent extends LitElement {
  render() {
    return html`(I'm another component.)`;
  }
}