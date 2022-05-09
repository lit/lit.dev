import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './styles.js';

@customElement('motion-carousel')
export class MotionCarousel extends LitElement {
  static styles = styles;

  private selectedInternal = 0;
  @property({type: Number})
  selected = 0;

  get maxSelected() {
    return this.childElementCount - 1;
  }

  hasValidSelected() {
    return this.selected >= 0 && this.selected <= this.maxSelected;
  }

  render() {
    if (this.hasValidSelected()) {
      this.selectedInternal = this.selected;
    }
    return html`
      <div class="fit">
        <slot></slot>
      </div>
    `;
  }

}
