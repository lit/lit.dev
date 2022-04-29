import {LitElement, html, css, PropertyValues} from 'lit';
import './blinky-box.js';

// TODO: define hasChanged function

class MyElement extends LitElement {
  // TODO: add hasChanged function on the date property
  static properties = {
    date: {}
  }

  constructor() {
    this.date = new Date();
  }

  onDatePicked() {
    const dateString = this._input.value;
    this.date = new Date(dateString);
  }

  firstUpdated() {
    this._input = this.shadowRoot.querySelector('input');
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
customElements.define('my-element', MyElement);
