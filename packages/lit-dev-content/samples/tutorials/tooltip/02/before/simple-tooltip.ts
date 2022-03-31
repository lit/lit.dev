import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('simple-tooltip')
export class SimpleTooltip extends LitElement {

  static styles = css`
    :host {
      display: inline-block;
      position: fixed;
      padding: 4px;
      border: 1px solid darkgray;
      border-radius: 4px;
      background: #ccc;
      pointer-events: none;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }

}
