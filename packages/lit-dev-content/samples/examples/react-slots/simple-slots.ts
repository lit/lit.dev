import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host, slot {
    border: 4px solid #343434;
    padding: 8px;
  }

  :host {
    box-sizing: border-box;
    display: grid;
    gap: 8px;
  }

  slot {
    display: block;
  }
`;

@customElement('simple-slots')
class SimpleSlots extends LitElement {
  static styles = styles;
  @property({ type: Number }) count = 0;

  render() {
    return html`
      <p>slot="head"</p>
      <slot name="head"></slot>
      <p>default slot</p>
      <slot></slot>
      <p>slot="tail"</p>
      <slot name="tail"></slot>
    `;
  }
}

export { SimpleSlots };
