import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  // TODO: Declare a reactive property `words`.

  render() {
    return html`<pre>${this.words}</pre>`;
  }
}

