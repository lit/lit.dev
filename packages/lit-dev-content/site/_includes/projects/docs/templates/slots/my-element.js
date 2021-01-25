import { LitElement, html } from 'lit-element';

class MyElement extends LitElement {
  render(){
    return html`
      <div style="border: dashed; margin: 8px; padding: 8px;">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('my-element', MyElement);
