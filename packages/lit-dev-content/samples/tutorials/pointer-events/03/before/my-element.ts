import {LitElement, html, css} from 'lit';
import {customElement, state, query} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @state() log = '';
  @state() enableMouseCapturing = false;
  @state() disableTouchCapturing = false;
  @query('#mousecapture') mouseCheckbox!: HTMLInputElement;
  @query('#touchcapture') touchCheckbox!: HTMLInputElement;
  @query('#block') target!: HTMLElement;

  static styles = [css`
  div {
    height: 100px;
    width: 100px;
    background: grey;
    user-select: none;
    touch-action: none;
  }
  label {
    font-size: 1rem;
  }
  `];

  render() {
    return html`
    <label>Capture Mouse Pointer <input type="checkbox" id="mousecapture" @change=${this.setCapturing}></label>
    <br>
    <label>Release Touch Pointer <input type="checkbox" id="touchcapture" @change=${this.setTouchCapturing}></label>
    <div
      id="block"
      @pointerdown=${this.handlePointer}
      @pointermove=${this.handlePointer}
      @pointerup=${this.handlePointer}
      @pointercancel=${this.handlePointer}
    >Touch Here</div>
    <pre>${this.log}</pre>
    `;
  }

  setCapturing() {
    this.enableMouseCapturing = this.mouseCheckbox.checked;
  }

  setTouchCapturing() {
    this.disableTouchCapturing = this.touchCheckbox.checked;
  }

  handlePointer(ev: PointerEvent) {
    const {type: eventType, x, y, buttons, isPrimary, pointerId, pointerType} = ev;
    // ignore mousemoves without holding a button and multiple fingers
    if (!isPrimary || eventType === 'pointermove' && buttons === 0) {
      return;
    }
    if (this.enableMouseCapturing && eventType === 'pointerdown' && pointerType !== 'touch') {
      this.target.setPointerCapture(pointerId);
    }
    if (this.disableTouchCapturing && eventType === 'pointerdown' && pointerType === 'touch' ) {
      this.target.releasePointerCapture(pointerId);
    }
    this.log = `${eventType} (${Math.round(x)}px, ${Math.round(y)}px)`;
  }
}
