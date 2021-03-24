import {LitElement, html} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private items = [
    {id: 0, name: "Justin"},
    {id: 1, name: "Steve"},
    {id: 2, name: "Kevin"},
    {id: 3, name: "Russell"},
    {id: 4, name: "Liz"},
    {id: 5, name: "Peter"},
  ];

  render() {
    return html`
      <h3>repeat directive example</h3>

      <button @click=${() => this.sort(1)}>Sort ascending</button>
      <button @click=${() => this.sort(-1)}>Sort descending</button><hr>

      With keying (DOM including checkbox state moves with items):
      <ul>
        ${repeat(this.items, (item) => item.id, (item, index) => html`
          <li>${index}: <label><input type="checkbox">${item.name}</label></li>`)}
      </ul><hr>

      Without keying (items are re-used in place, checkbox state does not change):
      <ul>
        ${repeat(this.items, (item, index) => html`
          <li>${index}: <label><input type="checkbox">${item.name}</label></li>`)}
      </ul>

    `;
  }

  private sort(dir: number) {
    this.items = [...this.items.sort((a, b) => a.name.localeCompare(b.name) * dir)];
  }
}
