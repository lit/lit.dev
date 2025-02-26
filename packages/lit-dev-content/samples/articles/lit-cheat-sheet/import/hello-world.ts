import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './another-component.js'

@customElement('hello-world')
export class HelloWorld extends LitElement {
  render() {
    return html`Hello, world! <another-component></another-component>`;
  }
}