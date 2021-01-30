import { LitElement, html, property, customElement } from '@polymer/lit-element';

@customElement('my-listener')
class MyListener extends LitElement {
  @property() canCheck = false;
  render() {
    return html`
      <p @checked=${this._checkedHandler}><slot></slot></p>
      <hr>
      <p>${this.canCheck ? 'Allowing' : 'Preventing'} check</p>
      <p><button @click=${this._clickHandler}>Toggle</button></p>`;
  }
  _checkedHandler(e) {
    if (!this.canCheck) {
      e.preventDefault();
      e.detail.message = '✅ Prevented!!';
    }
  }
  _clickHandler() {
    this.canCheck = !this.canCheck;
  }
}
