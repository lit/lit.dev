import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-listener')
class MyListener extends LitElement {
  @property() name = '';
  render() {
    return html`
      <p @mylogin=${this._loginListener}><slot></slot></p>
      <p>Login: ${this.name}</p>`;
  }
  _loginListener(e: CustomEvent) {
    this.name = e.detail.name;
  }
}
