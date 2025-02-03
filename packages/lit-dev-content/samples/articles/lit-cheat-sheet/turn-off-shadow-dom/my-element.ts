import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  override createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <p>This is not rendered in a shadow root</p>
      <p>Styles from <code>index.html</code> will leak in and <code>static styles</code> do not apply</p>
    `;
  }
}