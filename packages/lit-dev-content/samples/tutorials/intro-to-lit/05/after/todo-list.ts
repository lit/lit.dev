import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

@customElement('todo-list')
class ToDoList extends LitElement {
  @property()
  listItems = [
      { text: 'Start Lit tutorial', completed: true },
      { text: 'Make to-do list', completed: false }
    ];

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
        ${this.listItems.map((item) =>
          html`<li>${item.text}</li>`)}
      </ul>
      <input id="newitem" aria-label="New item">
      <button @click=${this.addToDo}>Add</button>
    `;
  }

  @query('#newitem')
  input!: HTMLInputElement;

  addToDo() {
    this.listItems.push({text: this.input.value, completed: false});
    this.input.value = '';
    this.requestUpdate();
  }
}

