import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {animate} from '@lit-labs/motion';
import {styleMap} from 'lit/directives/style-map.js';
import {styles} from './styles.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = styles;
  @property({type: Number}) selected = 0;

  data = Array(7).fill(null, 0);

  render() {
    return html`
      <section class="container">
        ${this.data.map((_v, i) => {
          const l = this.data.length;
          const c = Math.trunc(l / 2);
          const order = (l + c + i - this.selected) % l;
          const zIndex = order === 0 || order === l - 1 ? -1 : 1;
          const p = i / this.data.length;
          return html`<div
            @click=${order < c ? this.dec : this.inc}
            style=${styleMap({
              order: String(order),
              zIndex: String(zIndex),
              background: `hsl(
                    ${Math.trunc(360 * p)},
                    ${20 + Math.trunc(60 * p)}%,
                    ${30 + Math.trunc(30 * p)}%)`,
            })}
            class="card"
            ${animate()}
          >
            ${i}
          </div>`;
        })}
      </section>
    `;
  }

  shift(i: number) {
    const e = this.data.length - 1;
    return i > e ? 0 : i < 0 ? e : i;
  }

  dec() {
    this.selected = this.shift(this.selected - 1);
  }
  inc() {
    this.selected = this.shift(this.selected + 1);
  }
}
