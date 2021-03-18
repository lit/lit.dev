import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators';

@customElement('todo-list')
class ToDoList extends LitElement {
  @property()
  listItems: Array<string> = [
    'Make todo list',
    'Buy bread'
  ];

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
        ${this.listItems.map((item) =>
          html`<li>${item}</li>`)}
      </ul>
      <input @change=${this.addToDo} aria-label="New item">
    `;
  }

  addToDo(event: Event) {
    const input = event.target as HTMLInputElement;
    // Create a new array including the new item
    this.listItems = [...this.listItems, input.value];
    input.value = '';
  }
}

