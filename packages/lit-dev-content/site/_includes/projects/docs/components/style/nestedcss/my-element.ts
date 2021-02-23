import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators/custom-element';

const mainColor = css`red`;
@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    div { color: ${mainColor} }
  `;
  protected render() {
    return html`<div>Some content in a div</div>`;
  }
}
