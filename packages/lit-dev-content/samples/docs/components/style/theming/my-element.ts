import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      color: var(--my-element-text-color, black);
      background: var(--my-element-background-color, white);
      font-family: var(--my-element-font-family, Roboto);
      display: block;
      padding: 8px;
      margin: 8px;
    }
  `;
  protected render() {
    return html`<div>Hello World</div>`;
  }
}
