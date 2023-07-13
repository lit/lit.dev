import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

// A plain Lit component which can be used in any framework
@customElement('demo-greeting')
export class DemoGreeting extends LitElement {
  static styles = css`
    p {
      display: inline-block;
      border: solid 1px gray;
      background: white;
      padding: 0 1em;
    }
  `;

  @property() name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-greeting': DemoGreeting;
  }
}
