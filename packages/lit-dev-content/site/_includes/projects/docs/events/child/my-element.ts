import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Number}) count = 0;
  render() {
    return html`
      <p><button @click="${this._increment}">Click Me!</button></p>
      <p>Click count: ${this.count}</p>
    `;
  }
  _increment(e) {
    this.count++;
  }
}
