import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

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
