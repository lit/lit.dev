import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host {
    border: 4px solid #343434;
    box-sizing: border-box;
    display: grid;
    gap: 8px;
    padding: 8px;
  }

  slot {
    border-radius: 4px;
    border: 4px solid #343434;
    display: block;
    padding: 8px;
  }

  :nth-child(1), slot[name=head] {
    color: blue;
  }

  :nth-child(5), slot[name=tail] {
    color: purple;
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
