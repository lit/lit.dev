import { LitElement, html, PropertyValues} from "lit";
import {customElement, property, query} from 'lit/decorators.js';


@customElement('date-display')
class DateDisplay extends LitElement {
  @property({
    // For wrapper types like Date, simple comparison won't work, because
    // each Date is a new object
    hasChanged: (value: Date | undefined, oldValue: Date | undefined) => {
      return value?.toLocaleDateString() !== oldValue?.toLocaleDateString();
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
    const date = (e.target as HTMLInputElement).valueAsDate;
    if (date) {
      this.date = new Date(date.getFullYear(), date.getMonth(), date.getUTCDate());
    }
  }

  _chooseToday() {
    this.date = new Date();
  }
}

