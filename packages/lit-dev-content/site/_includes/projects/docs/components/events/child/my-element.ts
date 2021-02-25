import { LitElement, html, customElement, property } from '@polymer/lit-element';

@customElement('my-element')
export class MyElement extends LitElement {
  @property({type: Number}) count = 0;
  protected render() {
    return html`
      <p><button @click="${this._increment}">Click Me!</button></p>
      <p>Click count: ${this.count}</p>
    `;
  }
  private _increment(e: Event) {
    this.count++;
  }
}
