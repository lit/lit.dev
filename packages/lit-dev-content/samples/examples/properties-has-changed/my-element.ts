import { LitElement, html, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {isSameDate, localDateFromUTC} from './date-utils.js';

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

  updated(changed: PropertyValues) {
    if (changed.has('date')) {
      this.datefield.animate(this.frames, 1000);
    }
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @property() date?: Date;

  render() {
    return html`
      <p>Choose a date:
      <input type="date" @change=${this._dateChanged}></p>
      <p><button @click=${this._chooseToday}>Choose Today</button></p>
      <p>Date chosen: <date-display .date=${this.date}></date-display></p>
    `;
  }

  _dateChanged(e: Event) {
    const utcDate = (e.target as HTMLInputElement).valueAsDate;
    if (utcDate) {
      this.date = localDateFromUTC(utcDate);
    }
  }

  _chooseToday() {
    this.date = new Date();
  }
}

