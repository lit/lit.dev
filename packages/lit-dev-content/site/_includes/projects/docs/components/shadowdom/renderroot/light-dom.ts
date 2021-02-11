import { LitElement, html, customElement } from 'lit-element';

@customElement('light-dom')
export class LightDom extends LitElement {
  render() {
    return html`
      <p>Custom rendering without shadow DOM.</p>
    `;
  }
  createRenderRoot(){
    return this;
  }
}
