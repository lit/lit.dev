/*
  Dependencies for examples include:
  - React
  - ReactDOM
  - SimpleGreeting web component
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

@customElement('simple-greeting')
class SimpleGreeting extends LitElement {
  @property()
  name = 'Somebody';

  render() {
    return html`Good morning, <span>${this.name}</span>!`;
  }
}

export {React, ReactDOM, SimpleGreeting};