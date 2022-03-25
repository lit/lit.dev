import { LitElement, html, css } from 'lit';
import {customElement, property} from 'lit/decorators.js';

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

  @property()
  time = new Date();

  render() {
    return html`${timeFormat.format(this.time)}`;
  }
}

export const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: true
});
