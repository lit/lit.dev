import {LitElement, html} from 'lit';

export class ToDoList extends LitElement {
  static properties = {
    listItems: {attribute: false},
  };

  // TODO: Add styles here

  constructor() {
    super();
    this.listItems = [
      {text: 'Make to-do list', completed: true},
      {text: 'Add some styles', completed: false},
    ];
  }

  render() {
    return html`
      <h2>To Do</h2>
      <ul>
        ${this.listItems.map(
          (item) => html`
            <li
                class="TODO"
                @click=${() => this.toggleCompleted(item)}>
              ${item.text}
            </li>`
        )}
      </ul>
      <input id="newitem" aria-label="New item">
      <button @click=${this.addToDo}>Add</button>
    `;
  }

  toggleCompleted(item) {
    item.completed = !item.completed;
    this.requestUpdate();
  }

  get input() {
    return this.renderRoot?.querySelector('#newitem') ?? null;
  }

  addToDo() {
    this.listItems = [...this.listItems,
        {text: this.input.value, completed: false}];
    this.input.value = '';
  }
}
customElements.define('todo-list', ToDoList);
