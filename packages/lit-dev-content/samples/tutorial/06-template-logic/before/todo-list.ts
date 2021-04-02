import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('todo-list')
class ToDoList extends LitElement {
  @property()
  listItems: Array<string> = [
    'Make to-do list',
    'Buy bread'
  ];

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
         <!-- TODO: render list items -->
      </ul>
      <input @change=${this.addToDo} aria-label="New item">
    `;
  }

  addToDo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.listItems.push(input.value);
    this.requestUpdate();
    input.value = '';
  }
}

