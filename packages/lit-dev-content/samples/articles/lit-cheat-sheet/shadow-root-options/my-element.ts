import { html, LitElement, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  render() {
    return html`
      <p>
        Calling focus on this element will focus the first focusable element in
        its shadow root thanks to <code>delegatesFocus: true</code>. Just try
        clicking on this text and see how the input is focused instead.
      </p>
      <input placeholder="The first focusable element">
    `;
  }

  static styles = css`
    code {
      background-color: #f4f4f4;
      padding: 0.2em 0.4em;
    }
  `;
}