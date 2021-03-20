import {LitElement, html} from 'lit';

class MyElement extends LitElement {
  static get properties() {
    return {
      greeting: {},
      data: {attribute: false},
      _items: {state: true},
    };
  }

  constructor() {
    super();
    this.greeting = 'Hello';
    this.data = {name: 'Cora'};
    this._items = [1, 2, 3];
  }

  render() {
    return html`
      <p>${this.greeting} ${this.data.name}.</p>
      <p>You have ${this._items.length} items.</p>
    `;
  }
}
customElements.define('my-element', MyElement);
