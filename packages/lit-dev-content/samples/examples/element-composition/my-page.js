import { LitElement, html } from "lit-element";

import "./my-header.js";
import "./my-article.js";
import "./my-footer.js";

class MyPage extends LitElement {
  static properties = {
    header: {},
    text: {}
  };
  constructor() {
    super();
    this.header = "My Nifty Article";
    this.text = "Some witty text.";
  }
  render() {
    return html`
      <my-header .title=${this.header}></my-header>
      <my-article .text=${this.text}></my-article>
      <my-footer></my-footer>
    `;
  }
}
customElements.define("my-page", MyPage);
