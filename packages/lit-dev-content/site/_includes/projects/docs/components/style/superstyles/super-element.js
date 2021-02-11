import { LitElement, html, css } from 'lit-element';

export class SuperElement extends LitElement {
  static get styles() {
    return css`
      div {
        border: 1px solid gray;
        padding: 8px;
      }
    `;
  }
  render() {
    return html`
      <div>Content</div>
    `;
  }
}
customElements.define('super-element', SuperElement);
