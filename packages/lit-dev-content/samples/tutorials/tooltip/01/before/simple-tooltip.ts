import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('simple-tooltip')
export class SimpleTooltip extends LitElement {

  static styles = css`
    :host {
    }
  `;

  render() {
    return html`<slot></slot>`;
  }


}
