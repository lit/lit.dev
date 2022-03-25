import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  items = [
    { id: 0, task: 'Feed the cat'},
    { id: 1, task: 'Go for a walk'},
    { id: 2, task: 'Learn Lit'},
    { id: 3, task: 'Take a nap'},
]

  render() {
    return html`
      <p>Things to do today:</p>
      <button @click=${() => this._sort(1)}>Sort ascending</button>
      <button @click=${() => this._sort(-1)}>Sort descending</button>
      <ul>
        ${repeat(
          this.items,
          (item) => item.id,
          (item) => html`<li><label><input type="checkbox">${item.task}</label></li>`
        )}
      </ul>
    `;
  }

  private _sort(dir: number) {
    this.items = [...this.items.sort((a, b) => a.task.localeCompare(b.task) * dir)];
  }
}
