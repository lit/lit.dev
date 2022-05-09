import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {styles} from './styles.js';

@customElement('motion-carousel')
export class MotionCarousel extends LitElement {
  static styles = styles;

  render() {
    return html`
      <div class="fit">

      </div>
    `;
  }

}
