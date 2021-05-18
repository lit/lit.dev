import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property()
  condition = true;

  render() {
    return html`
      <p>Render content conditionally:</p>
      ${this.condition
        ? html`
            <p>Render some HTML if condition is true.</p>
          `
        : html`
            <p>Render some other HTML if condition is false.</p>
          `}
      <button @click=${() => {this.condition = !this.condition}}>Toggle condition</button>
    `;
  }
}
