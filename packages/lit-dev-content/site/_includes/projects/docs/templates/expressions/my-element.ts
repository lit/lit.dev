import { LitElement, html, property, customElement } from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property() greeting = `Hiya, let's get some stuff done...`;
  @property({type: Array}) todos = ['sleep', 'eat', 'work', 'exercise'];
  @property({type: Boolean}) show = false;
  render() {
    return html`
      <p>
        ${this.greeting}
        <button @click=${() => this.show = !this.show}>Todos</button>
      </p>
      ${this.show ?
        html`
          <ul>${this.todos.map(i => html`<li>${i}</li>`)}</ul>
        ` : ''}
    `;
  }
}
