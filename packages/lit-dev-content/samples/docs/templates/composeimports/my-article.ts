import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-article')
class MyArticle extends LitElement {
  render() {
    return html`
      <article>article</article>
    `;
  }
}
