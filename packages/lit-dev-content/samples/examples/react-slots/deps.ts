/*
  Dependencies for example include:
  - React
  - ReactDOM
  - CounterButton web component
*/

import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

@customElement('count-clicker')
class CountClicker extends LitElement {
  @property({type: Number}) count = 0;

  render() {
    return html`
      <slot name="decrease" @click="${this.onDecrease}"></slot>
      <slot name="increase" @click="${this.onIncrease}"></slot>
    `;
  }

  onDecrease = () => {
    this.count -= 1;
    this.dispatchClickCount()
  }

  onIncrease = () => {
    this.count += 1;
    this.dispatchClickCount()
  }

  dispatchClickCount = () => {
    this.dispatchEvent(
        new CustomEvent(
            'click-count',
            {
              detail: this.count,
              bubbles: true,
              composed: true,
            },
        ),
    );
  }
}

export {React, ReactDOM, CountClicker};