import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-listener')
class MyListener extends LitElement {
  @property({type: Number}) height: number|null = null;
  protected render() {
    return html`
      <p @opened=${this._listener} @closed=${this._listener}><slot></slot></p>
      <p>Height: ${this.height}px</p>`;
  }
  private _listener() {
    this.height = null;
  }
  protected updated() {
    if (this.height === null) {
      requestAnimationFrame(() => this.height = this.getBoundingClientRect().height);
    }
  }
}
