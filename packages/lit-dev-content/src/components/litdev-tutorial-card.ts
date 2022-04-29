/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

export type CardSize = 'tiny' | 'small' | 'medium' | 'large';
export type TutorialDifficulty = '' | 'Beginner' | 'Intermediate' | 'Advanced';

@customElement('litdev-tutorial-card')
export class LitdevTutorialCard extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      --_width: var(--tutorial-card-width, 300px);
      /* Generate a standardize horizontal grid
         based off of a unit */
      --_unit: calc(var(--_width) / 10);
      --_border-width: 1px;
      grid-column: span 1;
      position: relative;
    }

    :host([size='tiny']) {
      grid-row: span 1;
    }

    :host([size='small']) {
      grid-row: span 2;
    }

    :host([size='medium']) {
      grid-row: span 3;
    }

    :host([size='large']) {
      grid-row: span 4;
    }

    #root {
      width: var(--_width);
      box-sizing: border-box;
      padding: calc(var(--_unit) / 2);
      /* TODO(e111077): change to theme custom prop */
      border: var(--_border-width) solid #3e3e3e;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      /* TODO(e111077): change to theme custom prop */
      color: #3e3e3e;
      outline: none;
      position: relative;
      z-index: 0;
      /** TODO(e111077): change to theme custom prop */
      background-color: white;
    }

    #root > * {
      margin-block: calc(var(--_unit) * 0.25);
    }

    #root > *:first-child {
      margin-block-start: 0;
    }

    #root > *:last-child {
      margin-block-end: 0;
    }

    :host([size='tiny']) #root {
      /* 5 units = 4 units height + 1 unit grid spacer */
      height: calc(var(--_unit) * 4);
    }

    :host([size='small']) #root {
      /* 10 units = 9 units height + 1 unit grid spacer */
      height: calc(var(--_unit) * 9);
    }

    :host([size='medium']) #root {
      /* 15 units = 14 units height + 1 unit grid spacer */
      height: calc(var(--_unit) * 14);
    }

    :host([size='large']) #root {
      /* 20 units = 19 units height + 1 unit grid spacer */
      height: calc(var(--_unit) * 19);
    }

    #image-wrapper {
      --_height: calc(var(--_unit) * 5);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      height: var(--_height);
      min-height: var(--_height);
      /* Break out of root padding */
      margin-inline: calc(var(--_unit) * -0.5);
    }

    img {
      width: 100%;
    }

    #header {
      font-family: Manrope;
    }

    #header ::slotted(*) {
      font-weight: normal;
      margin: 0;
      font-size: calc(var(--_unit));
    }

    #metadata-container {
      /* TODO(e111077): change to theme custom prop */
      color: #6f6f6f;
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      justify-content: space-between;
      flex-direction: column-reverse;
    }

    #metadata {
      display: flex;
      justify-content: space-between;
    }

    #description,
    #metadata {
      font-family: 'Open Sans', sans-serif;
      font-size: calc(var(--_unit) * 0.5);
    }

    #description {
      overflow-y: hidden;
    }

    /* Markdown renderer will wrap content in <p> tags. Remove margins on the
    first and last */
    #description ::slotted(:first-of-type) {
      margin-block-start: 0;
    }

    #description ::slotted(:last-of-type) {
      margin-block-end: 0;
    }

    :host::before {
      content: '';
      position: absolute;
      /* Below the content */
      z-index: -1;
      inset: 0;
      transform: translate(0, 0);
      background-color: var(--color-blue);
    }

    #root,
    :host::before {
      transition: transform 100ms ease-out;
    }

    :host(:hover) #root,
    :host(:focus-within) #root {
      /* translate the root / content to up right */
      transform: translate(
        calc(var(--_unit) * 0.125),
        calc(var(--_unit) * -0.125)
      );
    }

    :host(:hover)::before,
    :host(:focus-within)::before {
      /* translate the background down left */
      transform: translate(
        calc(var(--_unit) * -0.125),
        calc(var(--_unit) * 0.125)
      );
    }

    @media (prefers-reduced-motion) {
      :host::before,
      #root {
        transition: none;
      }
    }
  `;

  /**
   * Which card size variant to use:
   * tiny = 1x0.5
   * small = 1x1
   * medium = 1x1.5
   * large = 1x2
   */
  @property({type: String, reflect: true}) size: CardSize = 'small';

  /**
   * Optional src for the image
   */
  @property({attribute: 'img-src'}) imgSrc = '';

  /**
   * Alt text for the image;
   */
  @property({attribute: 'img-alt'}) imgAlt = '';

  /**
   * Difficulty of the tutorial
   */
  @property() difficulty: TutorialDifficulty = '';

  /**
   * Duration of the tutorial in minutes
   */
  @property({type: Number}) duration = 0;

  /**
   * Whether or not to hide the description. Used when there is no description
   * and we don't what the whitespace associated with the node.
   */
  @property({type: Boolean, attribute: 'hide-description'}) hideDescription =
    false;

  /**
   * Link to tutorial
   */
  @property() href = '';

  render() {
    return html` <a id="root" href=${this.href}>
      <section id="header">
        <slot name="header"></slot>
      </section>
      ${when(this.imgSrc && this.size !== 'tiny', () => this.renderImg())}
      ${when(!this.hideDescription, () => this.renderDescription())}
      ${when(
        this.duration || this.difficulty,
        () => html`<section id="metadata-container">
          <div id="metadata">
            <div id="difficulty">${this.difficulty}</div>
            <div id="duration">${this.calculateDurationStr(this.duration)}</div>
          </div>
        </section>`
      )}
    </a>`;
  }

  private renderImg() {
    return html` <div id="image-wrapper">
      <img src=${this.imgSrc} alt=${this.imgAlt} loading="lazy" />
    </div>`;
  }

  private renderDescription() {
    return html`
      <section id="description">
        <slot></slot>
      </section>
    `;
  }

  /**
   * Calculates the user readable string of "X Hrs Y Mins" or "Z Minutes" if
   * under an hour given a duration in minutes. Empty string if duration is 0.
   *
   * @param duration Duration in Minutes
   * @returns A user-readable string of hours and minutes
   */
  private calculateDurationStr(duration: number) {
    if (duration === 0) {
      return '';
    }
    const hrs = Math.floor(duration / 60);
    const mins = duration % 60;
    const hrTrailingS = hrs !== 1 ? 's' : '';
    const minuteTrailingS = mins !== 1 ? 's' : '';

    // TODO(e111077): Make this localizable.
    if (hrs) {
      return `${hrs} Hr${hrTrailingS}${
        mins ? ` ${mins} Min${minuteTrailingS}` : ''
      }`;
    }

    return `${mins} Minute${minuteTrailingS}`;
  }
}
