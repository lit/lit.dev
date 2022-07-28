import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host {
    border: 4px solid #343434;
    box-sizing: border-box;
    display: flex;
    gap: 8px;
    padding: 8px;
  }

  slot {
    border-radius: 4px;
    border: 4px solid #343434;
    display: block;
    padding: 8px;
  }

  div:nth-child(1) {
    color: blue;
  }

  div:nth-child(3) {
    color: purple;
  }
`;

@customElement('simple-slots')
class SimpleSlots extends LitElement {
  static styles = styles;
  @property({ type: Number }) count = 0;

  render() {
    return html`
      <div>
        <p>slot="head"</p>
        <slot name="head"></slot>
      </div>
      <div>
        <p>default slot</p>
        <slot></slot>
      </div>
      <div>
        <p>slot="slot"</p>
        <slot name="tail"></slot>
      </div>
    `;
  }
}

export { SimpleSlots };
