import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host {
    display: flex;
  }

  div, slot::slotted(*) {
    margin: 8px;
    border: 4px solid #343434;
    border-radius: 4px;
  }

  slot::slotted(*) {
    margin: 8px;
    padding: 8px;
  }

  p {
    margin: 8px;
    font-family: monospace;
  }
`;

@customElement('simple-slots')
class SimpleSlots extends LitElement {
  static styles = styles;
  @property({ type: Number }) count = 0;

  render() {
    return html`
      <div>
        <p>head slot</p>
        <slot name="head"></slot>
      </div>
      <div>
        <p>defaut slot</p>
        <slot></slot>
      </div>
      <div>
        <p>tail slot</p>
        <slot name="tail"></slot>
      </div>
    `;
  }
}

export { SimpleSlots };
