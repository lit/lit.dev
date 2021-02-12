import { LitElement, html, css, customElement } from 'lit-element';

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
