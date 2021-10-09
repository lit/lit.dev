import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {classMap} from 'lit/directives/class-map.js';
import {animate, flyBelow, fadeIn} from '@lit-labs/motion';
import {styles} from './styles.js';

@customElement('motion-list')
export class MotionList extends LitElement {
  static styles = styles;

  data = [
    {value: 'One'},
    {value: 'Two'},
    {value: 'Three'},
    {value: 'Four'},
    {value: 'Five'},
  ];

  @state() list: {value: string}[] = this.data;

  @state() row = false;

  @state() count = 0;

  duration = 500;

  render() {
    return html`
      <ul class="tabs ${classMap({row: this.row})}">
        ${repeat(
          this.list,
          (i) => i,
          (item, i) =>
            html`<li
              ${animate({
                keyframeOptions: {
                  duration: this.duration,
                  delay: (i * this.duration) / this.list.length,
                  fill: 'both',
                },
                in: fadeIn,
                out: flyBelow,
                onComplete:
                  i === this.list.length - 1
                    ? () => this.changeLayout()
                    : undefined,
              })}
            >
              ${item.value}
            </li>`
        )}
      </ul>
    `;
  }

  async changeLayout() {
    await new Promise(requestAnimationFrame);
    this.count++;
    if (this.count % this.data.length === 0) {
      this.list = [];
    } else {
      this.row = !this.row;
      this.list = this.data.slice().sort(() => 0.5 - Math.random());
    }
  }
}
