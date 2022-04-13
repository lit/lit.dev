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
    >Touch Here</div>
    <pre>${this.log}</pre>
    `;
  }

  handleEvent(ev: PointerEvent) {
    const props = new Set([
      'x', 'y', 'pointerId', 'pointerType', 'isPrimary', 'pressure', 'tiltX', 'tiltY', 'width', 'height', 'twist', 'buttons'
    ]);
    const copy: {[key: string]: unknown} = {};
    for (let key in ev) {
      if (props.has(key)) {
        copy[key] = (ev as any)[key];
      }
    }
    this.log = JSON.stringify(copy, null, 2);
  }
}
