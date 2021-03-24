import {LitElement, html}  from 'lit';
import {customElement}  from 'lit/decorators.js';

@customElement('light-dom')
export class LightDom extends LitElement {
  protected render() {
    return html`
      <p>Custom rendering without shadow DOM.</p>
    `;
  }
  protected createRenderRoot(){
    return this;
  }
}
