import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

function formatDate(date: Date|undefined): string {
  let formatted = '';
  if (date && date instanceof Date) {
    formatted = `${date.getUTCMonth()+1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  }
  return formatted;
}

@customElement('blinky-box')
export class BlinkyBox extends LitElement {
  @property()
  date: Date|undefined;

  @state()
  _updated = false;

  static styles = css`
      @keyframes flash {
        0% {
          background-color: white;
        }
        50% {
          background-color: lightblue;
        }
        100% {
          background-color: white;
        }
      }
      :host {
        display: inline-block;
      }
      [updated] {
        animation: flash 1s;
      }
      `;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('date')) {
      this._updated = true;
    }
  }

  render() {
    return html`
      <div ?updated=${this._updated}
           @animationend=${() => this._updated = false}>
        ${formatDate(this.date)}
      </div>`;
  }
}

