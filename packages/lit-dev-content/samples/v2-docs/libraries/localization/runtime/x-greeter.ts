import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {msg, localized} from '@lit/localize';

@localized()
@customElement('x-greeter')
export class XGreeter extends LitElement {
  render() {
    return html`<p>${msg(html`Hello <b>World</b>!`)}</p>`;
  }
}
