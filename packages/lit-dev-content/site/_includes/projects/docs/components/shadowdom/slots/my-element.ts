import { LitElement, html, customElement } from 'lit-element';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`
      <p>
        <slot></slot>
      </p>
    `;
  }
}
