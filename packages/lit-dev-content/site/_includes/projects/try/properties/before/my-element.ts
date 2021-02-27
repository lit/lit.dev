import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  // TODO: declare a reactive property

  render() {
    return html`
      <p>TODO: Replace this text with your property</p>
    `;
  }
}
