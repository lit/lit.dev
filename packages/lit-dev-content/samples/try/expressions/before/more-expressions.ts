import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators';

@customElement('more-expressions')
class MoreExpressions extends LitElement {
  @property()
  checked: boolean = false;

  render() {
    return html`
      <label><input type="checkbox" @change=${this.setChecked}> Enable editing</label>
      <div>
         TODO: Add paragraph and input.
      </div>
    `;
  }

  setChecked(event: Event) {
    this.checked = (event.target as HTMLInputElement).checked;
  }
}

