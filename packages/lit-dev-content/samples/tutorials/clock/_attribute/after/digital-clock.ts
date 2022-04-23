import {LitElement, html, css, ComplexAttributeConverter} from 'lit';
import {customElement, property} from 'lit/decorators.js';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
});

const timeConverter: ComplexAttributeConverter = {
  fromAttribute(t: string) {
    return new Date(Date.parse(`01 Jan 1970 ${t}`));
  },
  toAttribute(t: Date) {
    return timeFormat.format(t);
  }
};

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

  @property({converter: timeConverter})
  time = new Date();

  render() {
    return html`${timeFormat.format(this.time)}`;
  }
}
