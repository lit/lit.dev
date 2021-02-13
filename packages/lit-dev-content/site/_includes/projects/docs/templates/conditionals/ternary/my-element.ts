import { LitElement, html, property, customElement } from 'lit-element';

@customElement('my-element')
class MyElement extends LitElement {
  @property() userName = '';
  render() {
    return html`
      <p>${this.userName
        ? html`Welcome ${this.userName}`
        : html`
          Please log in
          <input value=${this.userName} @change=${(e: Event) => this.userName = e.target.value}>
          <button>Login</button>
        `
      }</p>
    `;
  }
}
