import { LitElement, html, css } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { ClockController, timeConverter, timeFormat } from './clock-controller.js';



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

  private _clock = new ClockController(this);

  @property({converter: timeConverter})
  get time() { return this._clock.value; }
  set time(d: Date) { this._clock.value = d};

  render() {
    return html`${timeFormat.format(this.time)}`;
  }
}
