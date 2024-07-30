import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    p {
      color: blue;
      border: 1px solid black;
      padding: 4px;
      margin-block: 4px;
    }
  `;

  render() {
    return html`<p part="paragraph">This is in a shadow root!</p>`;
  }
}