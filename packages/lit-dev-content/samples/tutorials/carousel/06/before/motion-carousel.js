import {LitElement, html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import {styles} from './styles.js';

export class MotionCarousel extends LitElement {
  static styles = styles;

  static properties = { selected: {type: Number} };

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
  render() {
    const animateLeft = ``;
    const selectedLeft = ``;
    const previousLeft = ``;
    return html`
      <div class="fit"
        @click=${this.clickHandler}
        style=${styleMap({left: animateLeft})}
      >
        <div class="fit" style=${styleMap({left: previousLeft})}>
          <slot name="previous"></slot>
        </div>
        <div class="fit selected" style=${styleMap({left: selectedLeft})}>
          <slot name="selected"></slot>
        </div>
      </div>
    `;
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

  previous = -1;
  updated(changedProperties) {
    if (changedProperties.has('selected') || this.previous === -1) {
      this.updateSlots();
      this.previous = this.selected;
    }
  }

  updateSlots() {
    this.children[this.previous]?.removeAttribute('slot');
    this.children[this.selected]?.setAttribute('slot', 'selected');
  }
}
customElements.define('motion-carousel', MotionCarousel);
