import { LitElement, html, property, customElement } from '@polymer/lit-element';

@customElement('my-listener')
class MyListener extends LitElement {
  @property({type: String}) height: string|null = null;
  render() {
    return html`
      <p @opened=${this._Listener} @closed=${this._Listener}><slot></slot></p>
      <p>Height: ${this.height}px</p>`;
  }
  _Listener(e: Event) {
    this.height = null;
  }
  updated() {
    if (this.height === null) {
      requestAnimationFrame(() => this.height = this.getBoundingClientRect().height);
    }
  }
}
