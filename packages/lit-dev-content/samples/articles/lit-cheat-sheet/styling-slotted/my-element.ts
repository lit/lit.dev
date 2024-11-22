import { html, LitElement, css } from 'lit';
import { customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    ::slotted(*) {
      border: 1px solid black;
      padding: 1em;
      --my-element-child-border: 1px dashed red;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}
