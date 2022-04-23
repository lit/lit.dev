import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {styles} from './styles.js';

@customElement('motion-carousel')
export class MotionCarousel extends LitElement {
  static styles = styles;

  @query('slot[name="selected"]', true)
  private selectedSlot!: HTMLSlotElement;

  @query('slot[name="previous"]', true)
  private previousSlot!: HTMLSlotElement;

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

  private left = 0;
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

  private clickHandler(e: MouseEvent) {
    this.selected += Number(!e.shiftKey) || -1;
    const change = new CustomEvent('change',
      {detail: this.selected, bubbles: true, composed: true});
    this.dispatchEvent(change);
  }

  private previous?: number;
  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('selected') ||  this.previous === undefined) {
      this.updateSlots();
      this.previous = this.selected;
    }
  }

  private updateSlots() {
    // unset old slot state
    this.selectedSlot.assignedElements()[0]?.removeAttribute('slot');
    this.previousSlot.assignedElements()[0]?.removeAttribute('slot');
    // set slots
    this.children[this.previous!]?.setAttribute('slot', 'previous');
    this.children[this.selected]?.setAttribute('slot', 'selected');
  }

}
