import {html, LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({attribute: false})
  date = new Date();

  @property({type: String, attribute: 'date-str'})
  dateStr = this.date.toString();

  willUpdate(changed: PropertyValues<this>) {
    if (changed.has('dateStr') && this.dateStr) {
      this.date = new Date(this.dateStr);
    }
  }

  render() {
    const locale = 'en-US';
    const options: Intl.DateTimeFormatOptions =
        {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    return html`
      <p>The given date is: ${this.date.toLocaleDateString(locale, options)}</p>
    `;
  }
}