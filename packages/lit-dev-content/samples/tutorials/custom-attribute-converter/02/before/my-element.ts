import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: String, attribute: 'date-str'})
  dateStr = (new Date()).toString();

  @property({attribute: false})
  date = new Date(this.dateStr);

  willUpdate(changed: PropertyValues<this>) {
    if (changed.has('dateStr') && this.dateStr) {
      this.date = new Date(this.dateStr);
    }
  }

  render() {
    return html`
      <p>The given date is: ${this.date.toLocaleDateString()}</p>
    `;
  }
}