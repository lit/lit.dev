import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';

@customElement('bye-element')
export class ByeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    #message {
      position: fixed;
      background-color: cornflowerblue;
      color: white;
      padding: 10px;
    }
  `;
  @state()
  _showMessage = false;

  @query('#message')
  _message!: HTMLDivElement;

  render() {
    return html`
      <button @click=${() => this._showMessage = !this._showMessage}>Click me</button>
      <div id="message" ?hidden=${!this._showMessage}>
        That's all folks!
      </div>
    `;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('_showMessage')) {
      const rect = this._message.getBoundingClientRect();
      const startingX = 0 - rect.width;
      this._message.animate([
        { transform: `translateX(${startingX}px) scale(0.1)` },
        { transform: `translateX(0) translateY(0) scale(1)` }
      ], {
        duration: 500,
        easing: 'ease-out',
      });
    }
  }
}
