import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element';
import { styleMap } from 'lit/directives/style-map';

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
