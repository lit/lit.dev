import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`
      <p>Hello world! From my-element.</p>
    `;
  }
}
