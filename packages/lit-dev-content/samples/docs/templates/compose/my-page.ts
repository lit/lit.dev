import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

function headerTemplate(title) {
  return html`<header>${title}</header>`;
}
function articleTemplate(text) {
  return html`<article>${text}</article>`;
}
function footerTemplate() {
  return html`<footer>Your footer here.</footer>`;
}

@customElement('my-page')
class MyPage extends LitElement {
  @property({attribute: false})
  article: string = {
    title: 'My Nifty Article',
    text: 'Some witty text.',
  };

  render() {
    return html`
      ${headerTemplate(this.article.title)}
      ${articleTemplate(this.article.text)} ${footerTemplate()}
    `;
  }
}
