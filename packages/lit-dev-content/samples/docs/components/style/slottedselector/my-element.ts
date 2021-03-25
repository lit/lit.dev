import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    ::slotted(*) { font-family: Roboto; }
    ::slotted(p) { color: blue; }
    div ::slotted(*) { color: red; }
  `;
  protected render() {
    return html`
      <slot></slot>
      <div><slot name="hi"></slot></div>
    `;
  }
}
