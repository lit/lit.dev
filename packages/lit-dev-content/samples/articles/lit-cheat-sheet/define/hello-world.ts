import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('hello-world')
export class HelloWorld extends LitElement {
  render() {
    return html`<p>Hello, world!</p>`;
  }
}