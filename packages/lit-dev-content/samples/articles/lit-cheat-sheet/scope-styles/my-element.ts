import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`<p>I'm blue</p>`;
  }

  static styles = css`
    p {
      color: blue;
    }
  `;
}