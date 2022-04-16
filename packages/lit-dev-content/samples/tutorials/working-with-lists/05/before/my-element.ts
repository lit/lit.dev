import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  items = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Seattle'];

  @state()
  lastIndex = 0;

  render() {
    return html`
      <p>The last city I've been to: ${this.items[this.lastIndex]}</p>
      <ul>
        ${this.items.map(
          (item, index) => html`
            <li @mouseenter=${() => this._updateLastIndex(index)}>${item}</li>
          `
        )}
      </ul>
    `;
  }

  private _updateLastIndex(newIndex: number) {
    this.lastIndex = newIndex;
  }
}
