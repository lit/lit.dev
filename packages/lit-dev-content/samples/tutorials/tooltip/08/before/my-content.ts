import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './simple-tooltip.js';
import {SimpleTooltip, tooltip} from './simple-tooltip.js';

@customElement('my-content')
export class MyContent extends LitElement {
  /* playground-fold */
  static styles = css`
    .box {
      height: 80px;
      width: 80px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: steelblue;
    }

    .right {
      position: absolute;
      right: 16px;
    }

    .container, #greeting {
      display: inline-flex;
      align-items: center;
    }

    .icon {
      font-family: 'Material Icons';
      font-size: 20px;
      margin: 0 0.25em;
      cursor: pointer;
    }

  `;

  @property()
  name = 'Katara';
  /* playground-fold-end */

  render() {
    return html`
      <h3>Welcome</h3>
      <p>Who are you?
        <span class="container">
          <input .value=${this.name} @input=${this._inputChange}>
          <span class="icon">help_outline</span>
        </span>
        <simple-tooltip>Enter your name...</simple-tooltip>
      </p>
      <p>
        <span id="greeting">Hello, ${this.name}! <span class="icon">info_outline</span></span>
      </p>

      <h3>Some boxes hinted with tooltips</h3>
      <section>
        <div class="box">1</div>
        <simple-tooltip>This is box 1.</simple-tooltip>
        <div class="box">2</div>
        <simple-tooltip>This is box 2.</simple-tooltip>
        <div class="box right">3</div>
        <simple-tooltip>This is box 3 and it's way off on its own.</simple-tooltip>
      </section>
    `;
  }

  private _inputChange(e: InputEvent) {
    this.name = (e.target as HTMLInputElement).value;
  }

}
