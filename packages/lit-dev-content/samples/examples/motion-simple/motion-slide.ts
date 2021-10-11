import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {animate} from '@lit-labs/motion';

@customElement('motion-slide')
export class MotionSlide extends LitElement {
  @property({type: Boolean}) slid = false;
  static styles = css`
    .circle {
      position: relative;
      background: steelblue;
      --box-size: 25vw;
      height: var(--box-size);
      width: var(--box-size);
      border-radius: 50%;
    }

    .slid {
      left: calc(100% - var(--box-size));
    }
  `;

  render() {
    return html`
      <p>
        <button @click=${() => (this.slid = !this.slid)}>Slide</button>
      </p>
      <p class="circle ${classMap({slid: this.slid})}" ${animate()}></p>
    `;
  }
}
