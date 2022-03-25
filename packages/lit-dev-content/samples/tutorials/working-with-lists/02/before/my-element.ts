import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// TODO: import map directive.

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  items = new Set(['Apple', 'Banana', 'Grape', 'Orange', 'Lime'])

  render() {
    return html`
      <ul>
        <!-- TODO: Utilize map directive to render items. -->
      </ul>
    `;
  }
}
