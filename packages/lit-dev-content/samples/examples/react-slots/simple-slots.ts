import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const styles = css`
  :host, slot {
    border: 4px solid #343434;
    display: block;
    padding: 8px;
  }

  slot {
    border-color: cornflowerblue;
  }
    
  p {
    margin-bottom: 2px;
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
        <p>slot="tail"</p>
        <slot name="tail"></slot>
      </div>
    `;
  }
}

export { SimpleSlots };
