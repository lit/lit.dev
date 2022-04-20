import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({attribute: false})
  tasks = [
    { id: 0, label: 'Learn Lit'},
    { id: 1, label: 'Feed the cat'},
    { id: 2, label: 'Go for a walk'},
    { id: 3, label: 'Take a nap'},
  ];

  render() {
    return html`
      <p>Things to do today:</p>
      <button @click=${() => this._sort(1)}>Sort ascending</button>
      <button @click=${() => this._sort(-1)}>Sort descending</button>
      <ul>
        ${repeat(
          this.tasks,
          (task) => task.id,
          (task) => html`
            <li>
              <label><input type="checkbox" />${task.label} (${task.id})</label>
            </li>
          `
        )}
      </ul>
    `;
  }

  private _sort(dir: number) {
    this.tasks.sort((a, b) => a.label.localeCompare(b.label) * dir);
    this.requestUpdate();
  }
}
