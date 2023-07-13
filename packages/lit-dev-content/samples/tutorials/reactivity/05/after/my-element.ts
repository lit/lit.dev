import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
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
        TADA
      </div>
    `;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('_showMessage')) {
      const final = this._message.getBoundingClientRect().width;
      const starting = 0 - final;
      this._message.animate([
        { transform: `translateX(${starting}px)` },
        { transform: `translateX(0)` }
      ], {
        duration: 500,
        easing: 'ease-out',
      });
    }
  }
}
