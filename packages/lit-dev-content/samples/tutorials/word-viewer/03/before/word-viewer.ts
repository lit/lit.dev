import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  // TODO: Add `idx` state
  @property() words = 'initial value';

  render() {
    // TODO: Split the `words` by `'.'`, and from the resulting word array
    // only show the word on index `this.idx`.
    return html`<pre>${this.words}</pre>`;
  }
}

