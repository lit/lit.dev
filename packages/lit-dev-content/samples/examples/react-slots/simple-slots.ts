import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host {
    display: flex;
    border: 4px solid #343434;
  }

  slot {
    display: block;
    margin: 8px;
    padding: 8px;
    border: 4px solid #343434;
    border-radius: 4px;
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
