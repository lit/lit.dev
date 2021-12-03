/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * A sticky banner that displays underneath the main header.
 *
 * The purpose of this component is to synchronize the --banner-height CSS
 * custom property with the current height of the banner.
 *
 * The height of the banner is dynamic because in narrow layouts its content
 * might take up multiple lines.
 *
 * We need to know the height of the banner because it has position sticky, and
 * other sticky elements beneath it (e.g. the docs nav columns) need to account
 * for its height for their own positioning. We also need to account for it in
 * scroll-margin-top, so that headings don't get hidden under the banner when
 * navigating to an anchor.
 *
 * Note this component is inlined so that the --banner-height property gets set
 * as early as possible to minimize layout shift. It should not depend on lit or
 * other dependencies to keep its size minimal.
 */
export class LitDevBanner extends HTMLElement {
  private _observer: ResizeObserver | undefined;

  connectedCallback() {
    this._observer = new ResizeObserver((entries) => {
      const size = entries.find((entry) => entry.target === this)
        ?.borderBoxSize[0];
      if (size) {
        document.documentElement.style.setProperty(
          '--banner-height',
          `${size.blockSize}px`
        );
      }
    });
    this._observer.observe(this);
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = undefined;
  }
}

customElements.define('litdev-banner', LitDevBanner);

declare global {
  interface HTMLElementTagNameMap {
    'litdev-banner': LitDevBanner;
  }
}
