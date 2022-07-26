import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host {
    align-items: center;
    display: flex;
    gap: 32px; 
    justify-content: center;
  }

  ::slotted(div) {
    border-bottom: 4px solid #324fff;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    min-width: 96px;
  }
`;

@customElement('lyrical-slots')
class LyricalSlots extends LitElement {
  static styles = styles;
  @property({ type: Number }) count = 0;

  render() {
    return html`
      <slot name="head"></slot>
      <slot></slot>
      <slot name="tail"></slot>
    `;
  }
}

export { LyricalSlots };
