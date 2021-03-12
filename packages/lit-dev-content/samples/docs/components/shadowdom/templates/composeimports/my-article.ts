import {LitElement, html, customElement} from 'lit-element';

@customElement('my-article')
class MyArticle extends LitElement {
  render() {
    return html`
      <article>article</article>
    `;
  }
}
