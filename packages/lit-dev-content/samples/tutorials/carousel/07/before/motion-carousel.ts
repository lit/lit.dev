import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {styles} from './styles.js';
import {styleMap} from 'lit/directives/style-map.js';
@customElement('motion-carousel')
export class MotionCarousel extends LitElement {
  static styles = styles;

  @query('slot[name="selected"]', true)
  private selectedSlot!: HTMLSlotElement;

  @query('slot[name="previous"]', true)
  private previousSlot!: HTMLSlotElement;

  private selectedInternal = 0;
  @property({type: Number})
  selected = 0;

  get maxSelected() {
    return this.childElementCount - 1;
  }

  hasValidSelected() {
    return this.selected >= 0 && this.selected <= this.maxSelected;
  }

  private left = 0;
  render() {
    if (this.hasValidSelected()) {
      this.selectedInternal = this.selected;
    }
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
    const i = this.selected + (Number(!e.shiftKey) || -1);
    this.selected = i > this.maxSelected ? 0 : i < 0 ? this.maxSelected : i;
    const change = new CustomEvent('change',
      {detail: this.selected, bubbles: true, composed: true});
    this.dispatchEvent(change);
  }

  private previous = 0;
  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('selected') && this.hasValidSelected()) {
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

}
