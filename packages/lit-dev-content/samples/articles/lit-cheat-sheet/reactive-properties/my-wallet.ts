import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './id-card.js';

@customElement('my-wallet')
export class MyWallet extends LitElement {
  render() {
    return html`
      <id-card .name=${"Steven"} .age=${27} ?programmer=${true} .isCool=${true}></id-card>
      <!-- It can also convert attributes into properties -->
      <id-card name="Elliott" age="30" programmer></id-card>
      <!--
        NOTE: boolean-attribute="false" will be true, because the default
        boolean attribute converter uses .hasAttribute()
      -->
      <id-card name="Dan" age="35" programmer is-cool></id-card>
    `;
  }
}