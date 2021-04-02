import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

type ToDoItem = {
  text: string,
  completed: boolean
}

@customElement('todo-list')
export class ToDoList extends LitElement {
  static get styles() {
    return css`
      :host {
        font-weight: bold;
      }
      .completed {
        text-decoration-line: line-through;
      }
      .hide {
        display: none;
      }
    `;
  }

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
                class=${classMap({
                  completed: item.completed,
                  hide: item.completed && this.hideCompleted
                })}
                @click=${() => this.toggleCompleted(item)}}>${item.text}
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
