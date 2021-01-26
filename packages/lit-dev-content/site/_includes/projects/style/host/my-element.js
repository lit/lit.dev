import { LitElement, html, css } from 'lit-element';

class MyElement extends LitElement {
  static styles = css`
    /* Selects the host */
    :host {
      display: block;
      background-color: lightgray;
      padding: 8px;
    }
    /* Selects the host element if it has class "blue" */
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
