import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

/**
 * @fires secret-message {CustomEvent<string>} fires on button click and
 * contains a secret message in detail.
 */
@customElement('secret-button')
export class SecretButton extends LitElement {
  #dispatchSecretMessage() {
    this.dispatchEvent(
      new CustomEvent('secret-message', {detail: randomBucket(messages)})
    );
  }

  render() {
    return html`
      <button @click="${this.#dispatchSecretMessage}">
        dispatch secret message event
      </button>
    `;
  }
}

const messages: string[] = [
  'everything is going to be okay!',
  "you're amazing!",
  'when you ask for help, everyone wins!',
  'there is always sunshine somewhere!',
];

function randomBucket<T>(messages: T[]): T {
  const last = messages.length - 1;
  const prev = messages[last];

  const target = Math.floor(Math.random() * (messages.length - 1));

  messages[last] = messages[target];
  messages[target] = prev;

  return messages[last];
}

declare global {
  interface HTMLElementTagNameMap {
    'secret-button': SecretButton;
  }
}
