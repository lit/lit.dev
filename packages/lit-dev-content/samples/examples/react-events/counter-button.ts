import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('counter-button')
export class CounterButton extends LitElement {
  @property({type: Number}) count = 0;

  render() {
    return html`<button>click count: ${this.count}</button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'counter-button': CounterButton;
  }
}
