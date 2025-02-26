import { html, LitElement, isServer } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() focusedWithin = false;

  render() {
    return html`
      <button>Focus me!</button>
      ${this.focusedWithin ? html`<p>Something in this component was focused</p>` : ''}
    `;
  }

  constructor() {
    super();

    // Only want to do this in the browser since the server doesn't have the
    // concept of events or document.
    if (!isServer) {
      this.addEventListener('focusin', this.#onFocusin);
      this.addEventListener('focusout', this.#onFocusout);
    }
  }

  #onFocusin() {
    this.focusedWithin = true;
  }

  #onFocusout() {
    this.focusedWithin = false;
  }
}