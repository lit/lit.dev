import { LitElement, html, property, customElement } from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property() userName = '';
  render() {
    let message;
    if (this.userName) {
      message = html`Welcome ${this.userName}`;
    } else {
      message = html`
        Please log in
        <input value=${this.userName} @change=${(e: Event) => this.userName = e.target.value}>
        <button>Login</button>
      `;
    }
    return html`
      <p class="message">${message}</p>
    `;
  }
}
