import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {animate, AnimateController, flyBelow, fade} from '@lit-labs/motion';
import {styles} from './styles.js';

@customElement('motion-lit')
export class MotionLit extends LitElement {
  static styles = styles;

  lit = ['L', 'I', 'T'];

  @property({type: Array}) letters = this.lit;

  duration = 1000;
  controller = new AnimateController(this, {
    defaultOptions: {
      keyframeOptions: {
        duration: this.duration,
        fill: 'backwards',
      },
    },
    onComplete: () => this.changeLayout(),
  });
  constructor() {
    super();
    this.addEventListener('click', () => this.clickHandler());
  }

  render() {
    const delayTime = this.duration / (this.letters.length * 2.5);
    return html`
      ${this.letters?.map(
        (letter, i) =>
          html`<span
            class="letter"
            ${animate({
              keyframeOptions: {
                delay: i * delayTime,
              },
              in: fade,
              out: flyBelow,
            })}
            >${letter}</span
          >`
      )}
    `;
  }

  clickHandler() {
    if (this.controller.isAnimating) {
      this.controller.togglePlay();
    } else {
      this.changeLayout();
    }
  }

  changeLayout() {
    this.letters = this.letters.length ? [] : this.lit;
  }
}
