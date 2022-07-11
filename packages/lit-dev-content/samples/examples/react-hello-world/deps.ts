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

@customElement('simple-greeting')
class SimpleGreeting extends LitElement {
  @property()
  name = 'Somebody';

  render() {
    return html`Good morning, <span>${this.name}</span>!`;
  }
}

// React does not directly support es modules
const React = window.React;
const ReactDOM = window.ReactDOM;

export {React, ReactDOM, SimpleGreeting};