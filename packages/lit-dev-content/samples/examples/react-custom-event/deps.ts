import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

const React = window.React;
const ReactDOM = window.ReactDOM;


@customElement('secret-message-button')
class SecretMessageButton extends LitElement {
  render() {
    return html`<button @click="${this.onClick}">CLICK FOR SECRET!</button>`;
  }

  onClick = () => {
    this.dispatchEvent(
        new CustomEvent(
            'secret-message',
            { detail: "lit and react are super cool!" },
        ),
    );
  }
}


export {React, ReactDOM, SecretMessageButton};