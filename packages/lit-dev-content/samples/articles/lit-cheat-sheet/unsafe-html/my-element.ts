import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {renderLibrary} from './trusted-rendering-library.js';

@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`
      <div>
        Here is the output of a trusted rendering library:
        ${unsafeHTML(renderLibrary())}
      </div>
    `;
  }
}
