import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('demo-greeting')
export class DemoGreeting extends LitElement {
  @property() name = 'Somebody';

  render() {
    return html`Hello, ${this.name}!`;
  }
}
