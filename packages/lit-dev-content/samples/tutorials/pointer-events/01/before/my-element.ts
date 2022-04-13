import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @state() log = '';

  static styles = [css`
  div {
    height: 100px;
    width: 100px;
    background: grey;
    touch-action: none;
    text-align: middle;
    vertical-align: middle;
  }
  `];

  render() {
    return html`
    <div id="block"
    @pointerdown=${this.handleEvent}
    @pointerup=${this.handleEvent}
    @pointermove=${this.handleEvent}
    @pointerenter=${this.handleEvent}
    @pointerleave=${this.handleEvent}
    >Touch Here</div>
    <pre>${this.log}</pre>
    `;
  }

  handleEvent(ev: PointerEvent) {
    this.log += `${ev.type} from pointer ${ev.pointerId}\n`;
  }
}
