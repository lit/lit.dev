import { LitElement, html, property, customElement } from '@polymer/lit-element';

@customElement('my-dispatcher')
class MyDispatcher extends LitElement {
  @property({type: Boolean}) open = true;
  render() {
    return html`
      <p><button @click=${this._notify}>${this.open ? 'Close' : 'Open'}</button></p>
      <p ?hidden=${!this.open}>Content!</p>
    `;
  }
  async _notify() {
    this.open = !this.open;
    await this.updateComplete;
    const name = this.open ? 'opened' : 'closed';
    this.dispatchEvent(new CustomEvent(name, {bubbles: true, composed: true}));
  }
}
