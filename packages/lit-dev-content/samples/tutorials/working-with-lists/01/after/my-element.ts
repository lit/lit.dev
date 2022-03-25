import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  items = new Set(['Apple', 'Banana', 'Grape', 'Orange', 'Lime'])

  render() {
    const templates = [];
    for (const item of this.items) {
      templates.push(html`<li>${item}</li>`)
    }

    return html`
      <ul>
        ${templates}
      </ul>
    `;
  }
}
