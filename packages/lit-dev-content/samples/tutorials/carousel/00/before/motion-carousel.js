/* playground-fold */
import {LitElement, html, noChange} from 'lit';
import {animate} from '@lit-labs/motion';
import {styleMap} from 'lit/directives/style-map.js';
import {styles} from './styles.js';

export class MotionCarousel extends LitElement {
  static styles = styles;

  static properties = { selected: {type: Number} };

  get selectedSlot() {
    return (this.__selectedSlot ??=
      this.renderRoot?.querySelector('slot[name="selected"]') ?? null);
  }

  get previousSlot() {
    return (this.__previousSlot ??=
      this.renderRoot?.querySelector('slot[name="previous"]') ?? null);
  }

  isAdvancing = false;
  _selected = 0;
  get selected() {
    return this._selected;
  }

  set selected(i) {
    const max = this.childElementCount - 1;
    const old = this.selected;
    const wrapToStart = old === max && i > old;
    const wrapToEnd = old === 0 && i < old;
    const selected = wrapToStart
      ? 0
      : wrapToEnd
      ? max
      : Math.min(max, Math.max(0, i));
    if (selected !== old) {
      this._selected = selected;
      this.isAdvancing = i > old;
      this.requestUpdate('selected', old);
    }
  }

  left = 0;

  /**
   * Handle corner cases!
   *
   * This flag is set via the `onStart` and `onComplete` callbacks of the
   * `animate` directive. It's used to avoid moving again *while* animating
   * to ensure the relative position of the previous item doesn't change when
   * wrapping the selection value.
   *
   * When there is no move, the previous item would be positioned on top of
   * the selected item. We avoid this by applying `noChange` to its `left`
   * when not moving.
   */
  isAnimating = false;

  render() {
    const shouldMove =
      this.hasUpdated && !this.isAnimating && this.selected !== this.previous;
    const shouldAdvance = shouldMove && this.isAdvancing;
    const delta = (shouldMove ? Number(shouldAdvance) || -1 : 0) * 100;
    this.left -= delta;
    const animateLeft = `${this.left}%`;
    const selectedLeft = `${-this.left}%`;
    const previousLeft = `${-this.left - delta}%`;
    const w = 100 / this.childElementCount;
    const indicatorLeft = `${w * this.selected}%`;
    const indicatorWidth = `${w}%`;
    return html`
      <div class="fit"
        ${animate(() => ({
          onStart: () => (this.isAnimating = true),
          onComplete: () => (this.isAnimating = false),
        }))}
        @click=${this.clickHandler}
        style=${styleMap({left: animateLeft})}>
        <div class="fit" style=${
          shouldMove ? styleMap({left: previousLeft}) : noChange
        }>
          <slot name="previous"></slot>
        </div>
        <div class="fit selected" style=${
          shouldMove ? styleMap({left: selectedLeft}) : noChange
        }>
          <slot name="selected"></slot>
        </div>
      </div>
      <div class="bar">
        <div class="indicator"
          ${animate()}
          style=${styleMap({left: indicatorLeft, width: indicatorWidth})}></div>
      </div>
    `;
  }

  previous = -1;
  async updated(changedProperties) {
    if (changedProperties.has('selected') || this.previous === -1) {
      this.updateSlots();
      this.previous = this.selected;
    }
  }

  updateSlots() {
    // unset old slot state
    this.selectedSlot.assignedElements()[0]?.removeAttribute('slot');
    this.previousSlot.assignedElements()[0]?.removeAttribute('slot');
    // set slots
    this.children[this.previous]?.setAttribute('slot', 'previous');
    this.children[this.selected]?.setAttribute('slot', 'selected');
  }

  clickHandler(e) {
    this.selected += Number(!e.shiftKey) || -1;
    const change = new CustomEvent('change', {
      detail: this.selected,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(change);
  }
}
customElements.define('motion-carousel', MotionCarousel);
/* playground-fold-end */
