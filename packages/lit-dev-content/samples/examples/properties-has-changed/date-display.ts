import { LitElement, html, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {isSameDate} from './date-utils.js';

@customElement('date-display')
class DateDisplay extends LitElement {
  @property({
    // For wrapper types like Date, simple comparison won't work, because
    // each Date is a new object
    hasChanged: (value?: Date, oldValue?: Date) => {
      return !isSameDate(value, oldValue);
    }
  })
  date?: Date;

  @query('#datefield')
  datefield!: HTMLSpanElement;

  frames = [
    {backgroundColor: '#fff'},
    {backgroundColor: '#324fff' },
    {backgroundColor: '#fff'}
  ];

  render() {
    return html`<span id="datefield">${this.date?.toLocaleDateString()}</span>`;
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('date')) {
      this.datefield.animate(this.frames, 1000);
    }
  }
}
