import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  render() {
    return html`
      <h1>Rendering lists with Lit</h1>
      <p>Lit has built-in support for any iterables!</p>
      <h2>Array</h2>
      <p>
        ${['✨', '🔥', '❤️']}
      </p>
      <h2>Set</h2>
      <p>
        ${new Set(['A', 'B', 'C'])}
      </p>
      <h2>Generator</h2>
      <p>
        ${(function* () {
            for (let i = 1; i < 4; i++) yield i;
        })()}
      </p>
    `;
  }
}

