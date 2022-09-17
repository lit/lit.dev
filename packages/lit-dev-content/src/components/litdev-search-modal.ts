/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {css, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {searchIcon} from '../icons/search-icon.js';
import './litdev-search.js';
import type {LitDevSearch} from './litdev-search.js';

type DialogWithModal = HTMLDialogElement & {
  showModal: () => void;
  close: () => void;
};

@customElement('litdev-search-modal')
export class LitDevSearchModal extends LitElement {
  /**
   * Whether or not the dialog is open.
   */
  @property({type: Boolean}) open = false;

  @query('dialog', true) dialogEl!: DialogWithModal;
  @query('#content', true) contentWrapper!: HTMLElement;
  @query('litdev-search', true) searchEl!: LitDevSearch;

  /**
   * A settable function that returns the body elemenr or whatever element that
   * should have overflow hidden when the dialog is open.
   *
   * @returns The element that should have its overflow hidden when the dialog
   *     is open.
   */
  getBody = () => document?.body;

  render() {
    return html`
      <button
        aria-label="Site search"
        title="Site search"
        @click=${() => (this.open = true)}
      >
        ${searchIcon}
      </button>
      <dialog @click=${() => (this.open = false)}>
        <div id="content" @click=${(e: Event) => e.stopPropagation()}>
          <litdev-search @close=${() => (this.open = false)}></litdev-search>
        </div>
      </dialog>
    `;
  }

  /**
   * Shows or hides the dialog and sets the overflow of the body element.
   *
   * @param show Whether or not to show the dialog.
   */
  private showDialog(show: boolean) {
    const body = this.getBody();
    if (show) {
      this.dialogEl.showModal();
      this.searchEl.focus();
      if (body) {
        body.style.overflow = 'hidden';
      }
    } else {
      this.dialogEl.close();
      if (body) {
        body.style.overflow = '';
      }
    }
  }

  updated(changed: PropertyValues<this>) {
    super.updated(changed);

    if (changed.has('open')) {
      this.showDialog(this.open);
    }
  }

  static styles = css`
    :host {
      --search-modal-padding: 16px;
      display: block;
    }

    :host button {
      color: inherit;
      font-size: inherit;
      font-weight: inherit;
      font-family: inherit;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    button span {
      margin-inline-end: 4px;
    }

    dialog {
      padding: 0;
      border: none;
      inset-block: 60px auto;
      background-color: transparent;
      box-shadow: rgb(0 0 0 / 20%) 0px 11px 15px -7px,
        rgb(0 0 0 / 14%) 0px 24px 38px 3px, rgb(0 0 0 / 12%) 0px 9px 46px 8px;
    }

    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.32);
    }

    #content {
      padding: var(--search-modal-padding);
      box-sizing: border-box;
      width: 560px;
      max-width: 560px;
      background-color: var(--color-light-gray);
    }

    @media (max-width: 864px) {
      dialog {
        inset: 0;
        height: 100vh;
        width: 100vw;
      }

      #content {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: fixed;
        inset: 0;
      }

      litdev-search {
        flex-grow: 1;
      }
    }
  `;
}
