import { LitElement, html, css, unsafeCSS, customElement } from 'lit-element';

@customElement('my-element')
export class MyElement extends LitElement {
  static get styles() {
    const mainColor = 'red';
    return css`
      div { color: ${unsafeCSS(mainColor)} }
    `;
  }
  protected render() {
    return html`<div>Some content in a div</div>`;
  }
}
