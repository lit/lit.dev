import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './id-card.js';

@customElement('my-wallet')
export class MyWallet extends LitElement {
  render() {
    return html`
      <id-card .name=${"Steven"} .age=${27} ?programmer=${true}></id-card>
    `;
  }
}