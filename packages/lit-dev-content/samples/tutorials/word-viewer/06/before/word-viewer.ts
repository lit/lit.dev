import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('word-viewer')
class WordViewer extends LitElement {
  static styles = css`
    :host {
      background-color: white;
      color: violet;
      cursor: pointer;
      display: block;
    }
    pre {
      padding: 0.2em;
    }
  `;

  // TODO: Add `playDirection` state.
  @state() private idx = 0;
  @property() words = 'initial value';

  private intervalTimer?: number;

  connectedCallback() {
    super.connectedCallback();
    this.intervalTimer = setInterval(this.tickToNextWord, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.intervalTimer);
    this.intervalTimer = undefined;
  }

  render() {
    const splitWords = this.words.split('.');
    // TODO: Update math so it won't go negatively out of bounds.
    const word = splitWords[this.idx % splitWords.length];
    // TODO: Add @click event handler that calls `this.switchPlayDirection`
    return html`<pre>${word}</pre>`;
  }
  // TODO: Increment by `this.playDirection`
  tickToNextWord = () => { this.idx += 1; };

  // TODO: Add switchPlayDirection method.
}

