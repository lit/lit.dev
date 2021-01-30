import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-element')
class MyElement extends LitElement {
  @property() clicked = '';
  @property() focused = '';
  data = [1, 2, 3];
  render() {
    return html`
      <div key="container" @click=${this._clickHandler}>
        ${this.data.map(i => html`<p><button key=${i} @focus=${this._focusHandler}>Item ${i}</button></p>`)}
      </div>
      <p>Clicked: ${this.clicked}</p>
      <p>Focused: ${this.focused}</p>
    `;
  }
  _clickHandler(e) {
    this.clicked = e.target.getAttribute('key');
  }
  _focusHandler(e) {
    this.focused = e.target.textContent;
  }
}
