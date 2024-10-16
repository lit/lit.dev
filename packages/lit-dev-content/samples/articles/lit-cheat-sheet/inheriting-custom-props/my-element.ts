import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    p {
      color: var(--sys-color-on-background, blue);
      border: 1px solid var(--sys-color-outline, black);
      padding: var(--comp-my-element-padding, 4px);
      margin-block: var(--comp-my-element-margin, 4px);
    }
  `;
  render() {
    return html`<p>This is in a shadow root!</p>`;
  }
}