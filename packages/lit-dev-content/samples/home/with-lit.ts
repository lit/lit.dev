import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('w-lit')
export class WithLit extends LitElement {
  static styles = css`:host { font-family: sans-serif;
      /* playground-fold */
      display: inline-block;
      padding: 8px 16px;
      margin: 8px;
      background: #444;
      border-radius: 1em;
      color: white;
      letter-spacing: 0.1em;
      font-style: italic;
    }
  `;
  /* playground-fold-end */

  @property()
  job = 'Build';

  render() {
    return html`${this.job}-with-Lit`;
  }
}