import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {animate} from '@lit-labs/motion';
import {styles} from './styles.js';

@customElement('motion-grid')
export class MotionGrid extends LitElement {
  static styles = styles;

  @state() layout = 0;

  render() {
    const d = 1000;
    const a = Array(5).fill(null, 0);
    return html` <section
        @click=${() => (this.layout = (this.layout + 1) % (a.length - 1))}
        class="container layout${this.layout}"
      >
        ${a.map(
          (v, i) => html`<div
            class="item${i}"
            ${animate({
              keyframeOptions: {
                delay: (i * d) / (a.length * 2),
                duration: d,
                fill: 'both',
              },
            })}
          ></div>`
        )}
      </section>
      <span class="message">click</span>`;
  }
}
