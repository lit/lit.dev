import {LitElement, html, css} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';

const TOUCH_ACTIONS = [
  'auto',
  'none',
  'pan-left',
  'pan-right',
  'pan-x',
  'pan-up',
  'pan-down',
  'pan-y',
  'pinch-zoom',
  'manipulation'
];

@customElement('my-element')
class MyElement extends LitElement {
  @query('select') select!: HTMLSelectElement;
  @state() touchAction = 'auto';
  @state() log = '';

  static styles = [css`
  div {
    height: 150vh;
    width: 150vw;
    background: linear-gradient(to bottom right, #91ffff, #324fff);
    user-select: none;
  }
  span {
    font-size: 1rem;
  }
  pre {
    position: fixed;
  }
  `];

  render() {
    return html`
    <span>Touch action setting</span>
    <select @change=${this.setTouchAction}>
      ${repeat(TOUCH_ACTIONS, (action) => html`<option>${action}</option>`)}
    </select>
    <br>
    <br>
    <div
      id="block"
      style=${styleMap({'touch-action': this.touchAction})}
      @pointermove=${this.handlePointer}
      @pointercancel=${this.handlePointer}
    ><pre>${this.log}</pre></div>
    `;
  }

  setTouchAction() {
    this.touchAction = this.select.value;
  }

  handlePointer(ev: PointerEvent) {
    const {type, x, y, buttons} = ev;
    if (type === 'pointermove' && buttons === 0) {
      return;
    }
    this.log = `${type} (${x}px, ${y}px)`;
  }
}
