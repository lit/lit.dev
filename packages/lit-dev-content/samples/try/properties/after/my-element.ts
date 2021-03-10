import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property()
  message: string = 'Hello world! From my-element';

  render() {
    return html`
      <p>${this.message}</p>
    `;
  }
}
