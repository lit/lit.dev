import { LitElement, html, svg, css } from 'lit';
import {customElement, property } from 'lit/decorators.js';
import {range} from 'lit/directives/range.js';
import {map} from 'lit/directives/map.js';
import { ClockController, timeConverter } from './clock-controller.js';

@customElement('analog-clock')
export class AnalogClockElement extends LitElement {

  static styles = css`
    :host {
      display: block;
      aspect-ratio: 1 / 1;
    }
    [part~=face] {
      fill: white;
    }
    [part~=minutes] {
      stroke: #999;
      stroke-width: 0.5;
    }
    [part~=root] {
      stroke: #333;
    }
    [part~=minute-hand] {
      stroke: #666;
    }
    [part~=second-hand] {
      stroke: rgb(180,0,0);
    }
    [part~=second-counterweight] {
      stroke-width: 3;
    }
  `;

  private _clock = new ClockController(this);

  _userTime?: Date;

  @property({converter: timeConverter})
  get time() { return this._clock.value; }
  set time(d: Date) { this._clock.value = d; };

  render() {
    return html`
      <svg viewBox='0 0 100 100' part='root'>
        <g transform='translate(50,50)'>
          <circle class='clock-face' part='face' r='48'/>

          ${minuteTicks}
          ${hourTicks}

          <line part='hour-hand' class='hour' y1='2' y2='-20'
            transform='rotate(${ 30 * this.time.getHours() + this.time.getMinutes() / 2})'/>

          <line part='minute-hand' class='minute' y1='4' y2='-30'
            transform='rotate(${ 6 * this.time.getMinutes() + this.time.getSeconds() / 10})'/>

          <g part='second-hand' transform='rotate(${6 * (this.time.getSeconds())})'>
            <line part='second' y1='10' y2='-38'/>
            <line part='second-counterweight' y1='10' y2='2'/>
          </g>
        </g>
      </svg>
    `;
  }
}

const minuteTicks = [...map(range(0, 60), (i) =>
  svg`<line part='minutes' y1='42' y2='45' transform='rotate(${360 * i / 60})'/>`)];

const hourTicks = [...map(range(0, 12), (i) =>
  svg`<line part='hours' y1='32' y2='45' transform='rotate(${360 * i / 12})'/>`)];
