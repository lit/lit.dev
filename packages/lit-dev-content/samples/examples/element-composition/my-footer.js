import { LitElement, html } from "lit-element";

class MyFooter extends LitElement {
  render() {
    return html`
      <hr />
      <footer>Your footer here.</footer>
    `;
  }
}
customElements.define("my-footer", MyFooter);
