import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  render() {
    return html`<pre>A super expressive and efficient template!</pre>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "word-viewer": WordViewer
  }
}
