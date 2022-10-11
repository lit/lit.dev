import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {styleMap} from 'lit/directives/style-map.js';
import {IntersectionController} from '@lit-labs/observers/intersection_controller.js';

import {SHAPES} from './constants.js';
import {styles} from './styles.js';

/**
 * Show how a @lit-labs/observers IntersectionController can manage multiple
 * child elements.
 */
@customElement('intersection-demo')
export class MyElement extends LitElement {
  private intersectionController!: IntersectionController;
  static styles = styles;

  render() {
    return html`
      <div id="parallax">
        ${map(
          SHAPES,
          (item) =>
            html`<div
              class="hidden ${item.class}"
              style=${styleMap(item.styles)}
            ></div>`
        )}
      </div>
    `;
  }

  firstUpdated() {
    this.intersectionController = new IntersectionController(this, {
      // Prevent the controller from observing the host element.
      target: null,
      config: {threshold: 0.2},
      callback(entries) {
        for (const {isIntersecting, target} of entries) {
          if (isIntersecting) {
            target.classList.remove('hidden');
          } else {
            target.classList.add('hidden');
          }
        }
      },
    });
    this.shadowRoot
      ?.querySelectorAll('#parallax div')
      .forEach((item) => this.intersectionController.observe(item));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'intersection-demo': MyElement;
  }
}
