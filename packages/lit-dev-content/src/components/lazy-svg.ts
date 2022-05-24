/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, nothing, PropertyValues} from 'lit';
import {customElement, property, state, query} from 'lit/decorators.js';

export type LoadingStrategies = 'idle' | 'eager' | 'visible';

@customElement('lazy-svg')
export default class LazySvg extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @property()
  href = '';

  @property()
  label = '';

  @property({type: Boolean, attribute: 'svg-aria-hidden'})
  svgAriaHidden = false;

  @property({attribute: 'svg-role'})
  svgRole = '';

  @state()
  shouldLoad = false;

  @query('svg')
  private svgEl!: SVGElement;

  @property()
  loading = 'idle';

  @property({attribute: 'root-margin'})
  rootMargin = '0px 0px 100px 0px';


  willUpdate() {
    if (this.loading === 'eager') {
      this.shouldLoad = true;
    }
  }

  render() {
    // Lit SSR doesn't allow svg tagged templates yet
    return html`<svg
      aria-hidden=${this.svgAriaHidden ? 'true' : nothing}
      aria-label=${this.label ? this.label : nothing}
      role=${this.svgRole ? this.svgRole : nothing}
      part="svg"
    >
      <use href=${this.shouldLoad ? this.href : nothing}></use>
    </svg>`;
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('loading')) {
      if (this.loading === 'idle') {
        this.idleLoad();
      } else if (this.loading === 'visible') {
        this.visibleLoad();
      }
    }

    super.updated(changed);
  }

  private idleLoad() {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => (this.shouldLoad = true));
    }
  }

  private visibleLoad() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.shouldLoad = true;
          observer.disconnect();
        }
      },
      {
        rootMargin: this.rootMargin,
      }
    );
    observer.observe(this.svgEl);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lazy-svg': LazySvg;
  }
}
