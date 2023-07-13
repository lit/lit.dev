import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {
  animate,
  AnimateController,
  fadeInSlow,
  fadeOut,
} from '@lit-labs/motion';
import {onFrames, data, DataItem} from './support.js';
import {styles} from './styles.js';

@customElement('motion-hero')
export class MotionHero extends LitElement {
  static styles = styles;

  @property({type: Array}) data = data;

  @state() detail!: DataItem;

  controller = new AnimateController(this, {
    defaultOptions: {
      keyframeOptions: {
        duration: 750,
        fill: 'both',
      },
      onFrames,
    },
  });

  render() {
    return html`<div class="container">
      <ul class="cards fit">
        ${repeat(
          this.detail ? [] : this.data,
          (i) => i,
          (i, x) =>
            html`<li
              @click=${(e: Event) => this.clickHandler(e, i)}
              ${animate({
                out: fadeOut,
                id: `${i.id}:card`,
                inId: `${i.id}:detail`,
              })}
            >
              <div
                class="card-background fit"
                ${animate({
                  in: fadeInSlow,
                  skipInitial: true,
                })}
              ></div>
              <div class="card-content">
                <div
                  class="icon card-icon"
                  ${animate({
                    id: `${i.id}:card-icon`,
                    inId: `${i.id}:detail-icon`,
                    skipInitial: true,
                  })}
                >
                  pets
                </div>
              </div>
              <div
                class="divider"
                ${animate({
                  in: fadeInSlow,
                  skipInitial: true,
                })}
              ></div>
              <div class="card-header hero-text">
                <div
                  ${animate({
                    id: `${i.id}:card-header`,
                    inId: `${i.id}:detail-header`,
                    skipInitial: true,
                  })}
                >
                  <div class="card-header-title">${i.value}</div>
                  <div>${i.summary}</div>
                </div>
              </div>
            </li>`
        )}
      </ul>
      ${this.detail
        ? html`<div
            class="detail fit"
            @click=${this.clickHandler}
            ${animate({
              id: `${this.detail.id}:detail`,
              inId: `${this.detail.id}:card`,
            })}
          >
            <div class="detail-header">
              <div
                class="icon detail-header-icon"
                ${animate({
                  id: `${this.detail.id}:detail-icon`,
                  inId: `${this.detail.id}:card-icon`,
                })}
              >
                pets
              </div>
              <div
                class="detail-header-text hero-text"
                ${animate({
                  id: `${this.detail.id}:detail-header`,
                  inId: `${this.detail.id}:card-header`,
                })}
              >
                <div class="detail-header-title">${this.detail.value}</div>
                <div>${this.detail.summary}</div>
              </div>
            </div>
            <div
              class="detail-content divider-top"
              ${animate({
                in: fadeInSlow,
              })}
            >
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
              est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
              velit, sed quia non numquam eius modi tempora incidunt ut labore
              et dolore magnam aliquam quaerat voluptatem.
            </div>
          </div>`
        : ''}
    </div>`;
  }

  clickHandler(e: Event, item: DataItem) {
    if (this.controller.isAnimating) {
      this.controller.togglePlay();
    } else {
      this.detail = item;
    }
  }
}
