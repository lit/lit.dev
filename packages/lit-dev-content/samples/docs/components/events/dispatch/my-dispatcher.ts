import {LitElement, html} from 'lit';
import {customElement, query} from 'lit/decorators.js';

@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @query('input', true) _input!: HTMLInputElement;
  protected render() {
    return html`
      <p>Name: <input></p>
      <p><button @click=${this._dispatchLogin}>Login</button></p>
    `;
  }
  private _dispatchLogin() {
    const name = this._input.value.trim();
    if (name) {
      const options = {
        detail: {name},
        bubbles: true,
        composed: true
      };
      this.dispatchEvent(new CustomEvent('mylogin', options));
    }
  }
}
