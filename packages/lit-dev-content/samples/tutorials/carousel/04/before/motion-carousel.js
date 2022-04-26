import {LitElement, html} from 'lit';
import {styles} from './styles.js';

export class MotionCarousel extends LitElement {
  static styles = styles;

  static properties = { selected: {type: Number} };

  advancing = false;
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
      this.advancing = i > old;
      this.requestUpdate('selected', old);
    }
  }

  render() {
    return html`
      <div class="fit">
        <slot name="selected"></slot>
      </div>
    `;
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
