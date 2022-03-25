import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  items = new Set(['Apple', 'Banana', 'Grape', 'Orange', 'Lime'])

  render() {
    const templates = [];
    // TODO: populate templates with items.

    return html`
      <ul>
        <!-- TODO: Render templates. -->
      </ul>
    `;
  }
}
