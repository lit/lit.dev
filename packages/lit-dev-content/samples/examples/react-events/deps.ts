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

@customElement('counter-button')
class CounterButton extends LitElement {
  @property() count = 0;

  render() {
    return html`
      <button>click count: ${this.count}</button>
    `;
  }
}

export {React, ReactDOM, CounterButton};