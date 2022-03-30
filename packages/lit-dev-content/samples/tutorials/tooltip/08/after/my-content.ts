import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './simple-tooltip.js';
import {tooltip} from './simple-tooltip.js';

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

  `;

  @property()
  name = 'Somebody';
  /* playground-fold-end */
  render() {
    return html`
      <h3>Welcome</h3>
      <input .value=${this.name} @input=${this._inputChange}>
      <simple-tooltip>Enter your name...</simple-tooltip>
      <p>
        <span ${tooltip(html`${this.name}, there's coffee available in the lounge.`)}>Hello, ${this.name}!</span>
      </p>
      <h3>Here's an activity</h3>
      <section>
        <button>Do something...</button>
        <simple-tooltip>This button actually doesn't do anything!</simple-tooltip>
      </section>
      <h3>And something else to look at</h3>
      <section>
        <div class="box">1</div>
        <simple-tooltip>This is box 1.</simple-tooltip>
        <div class="box">2</div>
        <simple-tooltip>This is box 2.</simple-tooltip>
        <div class="box right">3</div>
        <simple-tooltip>This is box 3.</simple-tooltip>
      </section>
    `;
  }

  private _inputChange(e: InputEvent) {
    this.name = (e.target as HTMLInputElement).value;
  }

}
