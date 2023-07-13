import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

/**
 * @fires pop Fires when count reaches a random number between 1-6.
 * @fires reset Fires when reset button is clicked.
 */
@customElement('click-roulette')
export class ClickRoulette extends LitElement {
  static styles = css`
    div {
      display: inline-block;
      border: solid 1px gray;
      background: white;
      padding: 1em;
    }
  `;

  @property({type: Number})
  count = 0;

  @property({type: Boolean})
  fired = false;

  @state()
  private _loadedCount = Math.floor(Math.random() * 6) + 1;

  handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (++this.count === this._loadedCount) {
      this.fired = true;
      this.dispatchEvent(new Event('pop', {bubbles: true, composed: true}));
    }
  }

  handleReset(e: MouseEvent) {
    e.stopPropagation();
    this.count = 0;
    this.fired = false;
    this._loadedCount = Math.floor(Math.random() * 6) + 1;
    this.dispatchEvent(new Event('reset', {bubbles: true, composed: true}));
  }

  render() {
    return html`
      <div>
        <p>Clicked: ${this.count}</p>
        <button @click=${this.handleClick} ?disabled=${this.fired}>
          Click
        </button>
        <button @click=${this.handleReset}>Reset</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'click-roulette': ClickRoulette;
  }
}
