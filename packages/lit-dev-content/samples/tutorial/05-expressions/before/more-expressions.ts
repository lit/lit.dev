import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('more-expressions')
class MoreExpressions extends LitElement {
  @property()
  checked: boolean = false;

  @property()
  text: string = 'Hello there.';

  render() {
    return html`
      <label
        ><input type="checkbox" @change=${this.setChecked} /> Enable
        editing</label
      >
      <div>TODO: Add input with bindings.</div>
    `;
  }

  setChecked(event: Event) {
    this.checked = (event.target as HTMLInputElement).checked;
  }
}
