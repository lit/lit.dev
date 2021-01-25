import { LitElement, html, css } from 'lit-element';

const mainColor = css`red`;

class MyElement extends LitElement {
  static styles = css`
    div { color: ${mainColor} }
  `;
  render() {
    return html`<div>Some content in a div</div>`;
  }
}
customElements.define('my-element', MyElement);
