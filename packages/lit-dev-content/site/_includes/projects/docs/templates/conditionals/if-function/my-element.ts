import { LitElement, html, property, customElement } from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property() userName = '';
  getUserMessage() {
    if (this.userName) {
      return html`Welcome ${this.userName}`;
    } else {
      return html`
        Please log in
        <input value=${this.userName} @change=${(e: Event) => this.userName = e.target.value}>
        <button>Login</button>
      `;
    }
  }
  render() {
    return html`
      <p class="message">${this.getUserMessage()}</p>
    `;
  }
}
