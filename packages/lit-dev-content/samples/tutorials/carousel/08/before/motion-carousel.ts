import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {styles} from './styles.js';
import {animate} from '@lit-labs/motion';

@customElement('motion-carousel')
export class MotionCarousel extends LitElement {
  static styles = styles;

  private advancing = false;
  private _selected = 0;
  @property({type: Number})
  get selected() {
    return this._selected;
  }

  set selected(i: number) {
    const max = this.childElementCount - 1;
    const old = this.selected;
    const wrapToStart = old === max && i > old;
    const wrapToEnd = old === 0 && i < old;
    const selected = wrapToStart ? 0 : (wrapToEnd ? max :
      Math.min(max, Math.max(0, i)));
    if (selected !== old) {
      this._selected = selected;
      this.advancing = i > old;
      this.requestUpdate('selected', old);
    }
  }

  render() {
    const shouldMove = this.hasUpdated && this.selected !== this.previous;
    const shouldAdvance = shouldMove && this.advancing;
    const x = shouldMove ? shouldAdvance ? 2 : 0 : 1;
    const left = `-${x}00%`;
    return html`
      <div class="mover"
        ${animate(() => ({
            disabled: this.selected === this.previous,
            onComplete: () => this.requestUpdate()
        }))}
        @click=${this.clickHandler}
        style=${styleMap({left})}
      >
        <div class="item"><slot name="start"></slot></div>
        <div class="item"><slot name="selected"></slot></div>
        <div class="item"><slot name="end"></slot></div>
      </div>
    `;
  }

  private clickHandler(e: MouseEvent) {
    this.selected += Number(!e.shiftKey) || -1;
    const change = new CustomEvent('change',
      {detail: this.selected, bubbles: true, composed: true});
    this.dispatchEvent(change);
  }

  private previous?: number;
  protected updated() {
    this.updateSlots();
    this.previous = this.selected;
  }

  private updateSlots() {
    this.children[this.previous!]?.removeAttribute('slot');
    this.children[this.selected]?.setAttribute('slot', 'selected');
  }

}
