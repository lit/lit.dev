/* playground-fold */
import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property() greeting = `Hiya, let's get some stuff done...`;
  @property({type: Array}) todos = ['sleep!', 'eat', 'work', 'exercise'];
  @property({type: Boolean}) show = false;
  /* playground-fold-end */

  render() {
    return html`
      <p>
        ${this.greeting}
        <button @click=${() => this.show = !this.show}>Todos</button>
      </p>
      ${this.show ? html`
          <ul>${this.todos.map(i => html`<li>${i}</li>`)}</ul>
        ` : ''}`;
  }/* playground-fold */
}
