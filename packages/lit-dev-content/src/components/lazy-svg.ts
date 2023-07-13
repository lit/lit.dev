/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, nothing, PropertyValues} from 'lit';
import {customElement, property, state, query} from 'lit/decorators.js';
import {onIdle} from '../util/hydration-helpers.js';

/**
 * Strategies for loading the SVG. idle, waits for the idle callback, eager
 * loads immediately, and visible loads when the element is visible via
 * intersection observer.
 */
export type LoadingStrategy = 'idle' | 'eager' | 'visible';

/**
 * A component that adds lazy loading to SVG elements that use the `<use>` tag
 * to reference the SVG.
 */
@customElement('lazy-svg')
export default class LazySvg extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  /**
   * The URL of the SVG to load via the `<use>` element.
   *
   * e.g. "{{ site.baseurl }}/images/logos/google.svg#logo"
   */
  @property()
  href = '';

  /**
   * The `aria-label` to apply to the SVG.
   */
  @property()
  label = '';

  /**
   * Whether or not `aria-hidden="true"` should be applied to the SVG.
   */
  @property({type: Boolean, attribute: 'svg-aria-hidden'})
  svgAriaHidden = false;

  /**
   * The `role` to apply to the SVG.
   */
  @property({attribute: 'svg-role'})
  svgRole = '';

  /**
   * Strategies for loading the SVG:
   *
   * - `idle` waits for the idle callback
   * - `eager` loads immediately
   * - `visible` loads when the element is visible via intersection observer.
   */
  @property()
  loading: LoadingStrategy = 'idle';

  /**
   * The `rootMargin` to apply to the intersection observer.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#rootmargin
   */
  @property({attribute: 'root-margin'})
  rootMargin = '0px 0px 100px 0px';

  /**
   * Whether or not to load the SVG
   */
  @state()
  private _shouldLoad = false;

  @query('svg')
  private _svgEl!: SVGElement;

  willUpdate() {
    if (this.loading === 'eager') {
      this._shouldLoad = true;
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
      <use href=${this._shouldLoad ? this.href : nothing}></use>
    </svg>`;
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('loading')) {
      if (this.loading === 'idle') {
        onIdle(this._onIdle);
      } else if (this.loading === 'visible') {
        // Must happen in `updated` because in non-SSR the DOM is not ready
        this._visibleLoad();
      }
    }

    super.updated(changed);
  }

  private _onIdle = () => {
    this._shouldLoad = true;
  };

  private _visibleLoad() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this._shouldLoad = true;
          observer.disconnect();
        }
      },
      {
        rootMargin: this.rootMargin,
      }
    );
    observer.observe(this._svgEl);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lazy-svg': LazySvg;
  }
}
