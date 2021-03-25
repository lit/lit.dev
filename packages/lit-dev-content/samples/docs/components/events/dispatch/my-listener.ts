import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
@customElement('my-listener')
class MyListener extends LitElement {
  @property() name = '';
  protected render() {
    return html`
      <p @mylogin=${this._loginListener}><slot></slot></p>
      <p>Login: ${this.name}</p>`;
  }
  private _loginListener(e: CustomEvent) {
    this.name = e.detail.name;
  }
}
