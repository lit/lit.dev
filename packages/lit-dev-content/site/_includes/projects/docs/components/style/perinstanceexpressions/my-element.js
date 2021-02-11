import { LitElement, html, css } from 'lit-element';

const blueText = html`
  <style> :host { color: blue; } </style>
`;

const redText = html`
  <style> :host { color: red; } </style>
`;

class MyElement extends LitElement {
  static styles = css`
    div {
      margin: 8px;
    }
  `;
  static properties = {
    red: {type: Boolean}
  }
  _toggleColor() {
    this.red = !this.red;
  }
  render() {
    return html`
      <button @click=${this._toggleColor}>Toggle color</button>
      ${this.red ? redText : blueText}
      <div>Hello World</div>
    `;
  }
}
customElements.define('my-element', MyElement);
