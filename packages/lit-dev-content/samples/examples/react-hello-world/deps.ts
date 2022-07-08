/*
  Dependencies for examples including:
  - React
  - ReactDOM
  - SimpleGreeting web component
*/

import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

declare global {
  interface Window {
      React: any;
      ReactDOM: any;
  }
}

@customElement('simple-greeting')
class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  @property()
  name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}


// React does not directly support es modules
const React = window.React;
const ReactDOM = window.ReactDOM;

export {React, ReactDOM, SimpleGreeting};