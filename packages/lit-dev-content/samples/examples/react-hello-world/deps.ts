declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

const React = window.React;
const ReactDOM = window.ReactDOM;

@customElement('simple-greeting')
class SimpleGreeting extends LitElement {
  static styles = css`p { color: blue }`;

  @property()
  name = 'Somebody';

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}

export {React, ReactDOM, SimpleGreeting};