import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

type ToDoItem = {
  text: string,
  completed: boolean
}

@customElement('todo-list')
export class ToDoList extends LitElement {
  static styles = css`
    .completed {
      text-decoration-line: line-through;
      color: #777;
    }
  `;

  @property({attribute: false})
  listItems = [
    { text: 'Make to-do list', completed: true },
    { text: 'Add some styles', completed: true }
  ];

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
        ${this.listItems.map((item) =>
          html`
            <li
                class=${item.completed ? 'completed' : ''}
                @click=${() => this.toggleCompleted(item)}>
              ${item.text}
            </li>`
        )}
      </ul>
      <input id="newitem" aria-label="New item">
      <button @click=${this.addToDo}>Add</button>
    `;
  }

  toggleCompleted(item: ToDoItem) {
    item.completed = !item.completed;
    this.requestUpdate();
  }

  @query('#newitem')
  input!: HTMLInputElement;

  addToDo() {
    this.listItems = [...this.listItems,
        {text: this.input.value, completed: false}];
    this.input.value = '';
  }
}
