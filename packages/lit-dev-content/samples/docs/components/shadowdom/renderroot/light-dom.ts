import {LitElement, html, customElement} from 'lit-element';

@customElement('light-dom')
export class LightDom extends LitElement {
  protected render() {
    return html`
      <p>Custom rendering without shadow DOM (note, styling leaks in).</p>
    `;
  }
  protected createRenderRoot() {
    return this;
  }
}
