import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('date-display')
export class DateDisplay extends LitElement {
  @property({attribute: false})
  date = new Date();

  @property({type: String, attribute: 'date-str'})
  dateStr = '';

  render() {
    const locale = 'en-US';
    const options: Intl.DateTimeFormatOptions =
        {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    return html`
      <p>The given date is: ${this.date.toLocaleDateString(locale, options)}</p>
    `;
  }
}
