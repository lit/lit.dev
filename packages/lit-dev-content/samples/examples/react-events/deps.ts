import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

@customElement('demo-button')
class Button extends LitElement {
  render() {
    return html`
      <button>CLICK FOR SECRET!</button>
    `;
  }
}

export {React, ReactDOM, Button};