import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import './blinky-box.js';

function dateHasChanged(newDate: Date, oldDate: Date|undefined): boolean {
  const hasChanged = (oldDate == undefined) ||
    !(newDate.getFullYear() == oldDate.getFullYear() &&
    newDate.getMonth() == oldDate.getMonth() &&
    newDate.getDate() == oldDate.getDate());
  return hasChanged;
}

@customElement('my-element')
class MyElement extends LitElement {
  @property({hasChanged: dateHasChanged})
  date = new Date();

  @query('input')
  _input!: HTMLInputElement;


  onDatePicked(): void {
    const dateString = this._input.value;
    this.date = new Date(dateString);
  }

  render() {
    return html`

      <input type="date">
      <button @click=${this.onDatePicked}>Set date</button>
      <div>
        Selected date:
        <blinky-box .date=${this.date}></blinky-box>
      </div>
    `;
  }
}
