/*
  Dependencies for example include:
  - React
  - ReactDOM
  - SecretButton web component
*/

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

declare global {
  interface Window {
    React: any;
    ReactDOM: any;
  }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

const messages: string[] = [
  "everything is going to be okay!",
  "you're amazing!",
  "when you ask for help, everyone wins!",
  "there is always sunshine somewhere!",
];

function randomBucket<T>(messages: T[]): T {
  const last = messages.length - 1;
  const prev = messages[last];

  const target = Math.floor(Math.random() * (messages.length - 1));

  messages[last] = messages[target];
  messages[target] = prev;

  return messages[last];
}

@customElement('secret-button')
class SecretButton extends LitElement {
  render() {
    return html`
      <button @click="${this.onClick}">dispatch secret message</button>
    `;
  }

  onClick = () => {
    this.dispatchEvent(
      new CustomEvent(
        'secret-message',
        { detail: randomBucket(messages) },
      ),
    );
  }
}

export { React, ReactDOM, SecretButton };