import { LitElement, html, css, customElement } from 'lit-element';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      background-color: lightgray;
      padding: 8px;
    }
    :host(.blue) {
      background-color: aliceblue;
      color: darkgreen;
    }
  `;
  protected render() {
    return html`Hello World`;
  }
}
