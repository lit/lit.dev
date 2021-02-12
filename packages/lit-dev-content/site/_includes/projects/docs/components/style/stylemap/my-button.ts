import { LitElement, html, customElement } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';

@customElement('my-button')
export class MyButton extends LitElement {
  protected render() {
    return html`
      <button style=${styleMap({
        backgroundColor: 'lightgreen',
        padding: '8px'
      })}>A button</button>
    `;
  }
}
