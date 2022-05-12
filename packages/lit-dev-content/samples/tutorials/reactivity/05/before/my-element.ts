import {LitElement, html, css, PropertyValues, PropertyValueMap} from 'lit';
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
}
