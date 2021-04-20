import { LitElement, css, html } from "lit";
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  static styles =
    css`
      ::slotted(*) {
        border: 1px solid blue;
      	padding: 6px;
      }
    `;
  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}
