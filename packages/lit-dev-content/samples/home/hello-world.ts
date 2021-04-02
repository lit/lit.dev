import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('hello-world')
export class HelloWorld extends LitElement {
  static styles = css`
    h2 { color: blue; }
  `;

  @property()
  name = 'World';

  render() {
    return html`<h2>Hello ${this.name}!</h2>`;
  }
}