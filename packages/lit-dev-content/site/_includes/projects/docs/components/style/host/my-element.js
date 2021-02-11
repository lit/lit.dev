import { LitElement, html, css } from 'lit-element';

class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: lightgray;
      padding: 8px;
    }
    :host(.blue) {
      background-color: aliceblue;
      color: darkgreen;
    }
  `;
  render() {
    return html`Hello World`;
  }
}
customElements.define('my-element', MyElement);
