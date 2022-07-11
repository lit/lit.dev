/*
  Dependencies for example include:
  - React
  - ReactDOM
  - Counter web component
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

@customElement('quick-counter')
class QuickCounter extends LitElement {
  @property() count = 0;


  render() {
    return html`
      <div @click="${this.increase}">
        <p>count: ${this.count}</p>
        <slot name="decrease"></slot>
        <slot name="increase"></slot>
      </div>
    `;
  }

  decrease = () => {this.count -= 1; console.log(this.count);};
  increase = () => {this.count += 1; console.log(this.count);};
}

export {React, ReactDOM, QuickCounter};