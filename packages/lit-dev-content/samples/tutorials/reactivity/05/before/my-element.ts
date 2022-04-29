import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import './blinky-box.js';

// TODO: define hasChanged function

@customElement('my-element')
class MyElement extends LitElement {
  // TODO: add hasChanged function on the date property
  @property()
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
