import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() private someBoolean = false;

  render() {
    let someText = html`<p>Some text</p>`;

    if (this.someBoolean) {
      someText = html`<p>Some other text</p>`;
    }

    return html`
      <button
          @click=${() => {this.someBoolean = !this.someBoolean}}>
        Toggle template
      </button>
      <div>This is an inline ternary conditional</div>
      ${this.someBoolean ? html`<p>Some other text</p>` : html`<p>Some text</p>`}
      <div>This is a variable conditional</div>
      ${someText}
    `;
  }
}