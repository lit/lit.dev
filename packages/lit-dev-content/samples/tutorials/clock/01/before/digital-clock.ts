import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('digital-clock')
export class DigitalClockElement extends LitElement {

  static styles = css`
    :host {
      display: block;
      font-family: Monospace;
      font-size: 3em;
      text-align: center;
    }
  `;

  render() {
    return html``;
  }
}
