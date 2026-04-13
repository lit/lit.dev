import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  // Duration affects render, so it should be reactive. Though we don't want it
  // to be exposed to consumers of my-element because we only want to expose
  // `start()`, `pause()`, `reset()`, so we use a private state.
  @state() private _duration = 0;
  // isPlaying affects render, so it should be reactive. Though we don't want it
  // to be exposed to consumers of my-element, so we use a private state.
  @state() private _isPlaying = false;
  private lastTick = 0;

  render() {
    const min = Math.floor(this._duration / 60000);
    const sec = pad(min, Math.floor(this._duration / 1000 % 60));
    const hun = pad(true, Math.floor(this._duration % 1000 / 10));

    return html`
      <div>
        ${min ? `${min}:${sec}.${hun}` : `${sec}.${hun}`}
      </div>
      <div>
        ${this._isPlaying ?
        html`<button @click=${this.pause}>Pause</button>` :
        html`<button @click=${this.start}>Play</button>`
      }
        <button @click=${this.reset}>Reset</button>
      </div>
    `;
  }

  start() {
    this._isPlaying = true;
    this.lastTick = Date.now();
    this._tick();
  }

  pause() {
    this._isPlaying = false;
  }

  reset() {
    this._duration = 0;
  }

  private _tick() {
    if (this._isPlaying) {
      const now = Date.now();
      this._duration += Math.max(0, now - this.lastTick);
      this.lastTick = now;
      requestAnimationFrame(() => this._tick());
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.reset();
  }
}
/* playground-fold */
function pad(pad: unknown, val: number) {
  return pad ? String(val).padStart(2, '0') : val;
}
/* playground-fold-end */
