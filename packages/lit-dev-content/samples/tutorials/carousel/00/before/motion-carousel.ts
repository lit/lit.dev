/* playground-fold */
import {LitElement, html, PropertyValues, noChange} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {animate} from '@lit-labs/motion';
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
  private isAnimating = false;

  render() {
    const shouldMove = this.hasUpdated &&
        !this.isAnimating &&
        this.selected !== this.previous;
    const shouldAdvance = shouldMove && this.advancing;
    const delta = (shouldMove ? Number(shouldAdvance) || -1 : 0) * 100;
    this.left -= delta;
    const animateLeft = `${this.left}%`;
    const selectedLeft = `${-this.left}%`;
    const previousLeft = `${-this.left - delta}%`;
    return html`
      <div class="fit"
        ${animate(() => ({
          onStart: () => this.isAnimating = true,
          onComplete: () => this.isAnimating = false}))}
        @click=${this.clickHandler}
        style=${styleMap({left: animateLeft})}>
        <div class="fit" style=${shouldMove ? styleMap({left: previousLeft}) : noChange}>
          <slot name="previous"></slot>
        </div>
        <div class="fit selected" style=${shouldMove ? styleMap({left: selectedLeft}) : noChange}>
          <slot name="selected"></slot>
        </div>
      </div>
    `;
  }

  private previous = -1;
  protected async updated(changedProperties: PropertyValues) {
    if (changedProperties.has('selected') || this.previous === -1) {
      this.updateSlots();
      this.previous = this.selected;
    }
  }

  private updateSlots() {
    // unset old slot state
    this.selectedSlot.assignedElements()[0]?.removeAttribute('slot');
    this.previousSlot.assignedElements()[0]?.removeAttribute('slot');
    // set slots
    this.children[this.previous]?.setAttribute('slot', 'previous');
    this.children[this.selected]?.setAttribute('slot', 'selected');
  }

  private clickHandler(e: MouseEvent) {
    this.selected += Number(!e.shiftKey) || -1;
    const change = new CustomEvent('change',
      {detail: this.selected, bubbles: true, composed: true});
    this.dispatchEvent(change);
  }

}
/* playground-fold-end */
