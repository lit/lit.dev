import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {dateConverter} from './date-converter.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({converter: dateConverter})
  date = new Date();

  render() {
    return html`
      <p>The given date is: ${this.date.toLocaleDateString()}</p>
    `;
  }
}