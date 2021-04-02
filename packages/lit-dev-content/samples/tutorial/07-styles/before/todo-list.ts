import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

@customElement('todo-list')
export class ToDoList extends LitElement {

  // TODO: Add styles here

  @property()
  listItems = [
    { text: 'Make to-do list', completed: true },
    { text: 'Complete Lit tutorial', completed: false }
  ];
  @property()
  hideCompleted = false;

  render() {
    return html`
      <h2>To Do</h2>
      <ul ?hide-completed=${this.hideCompleted}>
        ${this.listItems.map((item, index) =>
          html`<li data-index=${index}
                class="TODO"
                @click=${() => this.toggleCompleted(item)}>${item.text}
          </li>`
        )}
      </ul>
      <input @change=${this.addToDo} aria-label="New item">
      <button @click=${() => {this.hideCompleted = !this.hideCompleted}}>
        ${this.hideCompleted ? 'Show' : 'Hide'} completed
      </button>
    `;
  }

  toggleCompleted(item: ToDoItem) {
    item.completed = !item.completed;
    this.requestUpdate();
  }

  addToDo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.listItems.push({ text: input.value, completed: false });
    this.requestUpdate();
    input.value = '';
  }
}

