import { LitElement, html, css } from 'lit-element';

class MyElement extends LitElement {
  static styles = css`
    p { color: green; }
  `;
  render(){
    return html`
      <p>Template renders in shadow DOM.</p>
    `;
  }
}
customElements.define('my-element', MyElement);
