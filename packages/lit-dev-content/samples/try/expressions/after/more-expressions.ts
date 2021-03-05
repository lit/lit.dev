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
        <p ?hidden=${this.checked}>Click checkbox to edit text.</p>
        <input .disabled=${!this.checked} value="Hello there">
      </div>
    `;
  }

  setChecked(event: Event) {
    this.checked = (event.target as HTMLInputElement).checked;
  }
}
