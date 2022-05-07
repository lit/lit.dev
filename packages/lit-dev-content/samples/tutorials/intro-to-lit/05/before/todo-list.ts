import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

@customElement('todo-list')
export class ToDoList extends LitElement {
  @property({attribute: false})
  listItems = [
    { text: 'Start Lit tutorial', completed: true },
    { text: 'Make to-do list', completed: false }
  ];

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
         <!-- TODO: Render list items. -->
      </ul>
      <input id="newitem" aria-label="New item">
      <button @click=${this.addToDo}>Add</button>
    `;
  }

  // TODO: Add click handler.
  addToDo() {
  }
}

