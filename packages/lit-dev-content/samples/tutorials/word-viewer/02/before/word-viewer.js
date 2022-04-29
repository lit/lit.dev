import { html, LitElement } from 'lit';


class WordViewer extends LitElement {
  // TODO: Declare a reactive property `words`.

  render() {
    return html`<pre>${this.words}</pre>`;
  }
}
customElements.define('word-viewer', WordViewer);
