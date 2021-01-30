import { LitElement, html, customElement, query } from '@polymer/lit-element';
@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @query('input', true) _input!: HTMLInputElement;
  render() {
    return html`
      <p>Name: <input></p>
      <p><button @click=${this._dispatchLogin}>Login</button></p>
    `;
  }
  _dispatchLogin() {
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
