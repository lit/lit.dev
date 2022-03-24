import { LitElement, html, svg } from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {range} from 'lit/directives/range.js';
import {map} from 'lit/directives/map.js';
import {styles} from './styles.js';

@customElement('lit-clock')
export class LitClock extends LitElement {

  static styles = styles;

  @property()
  date: Date = new Date();

  render() {
    return html`
      <style>

      </style>
      <svg viewBox='0 0 100 100'>
        <g transform='translate(50,50)'>
          <circle class='clock-face' r='48'/>

          ${minuteTicks}
          ${hourTicks}

          <line class='hour' y1='2' y2='-20'
            transform='rotate(${ 30 * this.date.getHours() + this.date.getMinutes() / 2})'/>

          <line class='minute' y1='4' y2='-30'
            transform='rotate(${ 6 * this.date.getMinutes() + this.date.getSeconds() / 10})'/>

          <g transform='rotate(${ 6 * this.date.getSeconds()})'>
            <line class='second' y1='10' y2='-38'/>
            <line class='second-counterweight' y1='10' y2='2'/>
          </g>
        </g>
      </svg>
    `;
  }
}

const minuteTicks = map(range(0, 60), (i) =>
  svg`<line class='minor' y1='42' y2='45' transform='rotate(${360 * i / 60})'/>`);

const hourTicks = map(range(0, 12), (i) =>
  svg`<line class='major' y1='32' y2='45' transform='rotate(${360 * i / 12})'/>`);
