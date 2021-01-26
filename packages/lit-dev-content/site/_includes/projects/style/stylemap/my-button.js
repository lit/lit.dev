import { LitElement, html, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';

class MyButton extends LitElement {
  render() {
    return html`
      <button style=${styleMap({
        backgroundColor: 'lightgreen',
        padding: '8px'
      })}>A button</button>
    `;
  }
}
customElements.define('my-button', MyButton);
