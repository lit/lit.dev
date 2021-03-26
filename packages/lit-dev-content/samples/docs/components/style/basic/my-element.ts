import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    p {
      color: green;
    }
  `;
  protected render() {
    return html`<p>I am green!</p>`;
  }
}
