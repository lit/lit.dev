import {html, LitElement, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @property() iframeText = 'This is coming from outside the iframe';
  @query('iframe') iframeEl!: HTMLIFrameElement;

  updated(changed: PropertyValues<this>) {
    // The Reactive Property iframeText relies on the <iframe> element rendered
    // in the shadow DOM. This means that we need to reconcile the state of
    // iframeText when the <iframe> element in the `updated()` lifecycle method.
    if (changed.has('iframeText')) {
      this.#updateIframeContents(this.iframeText);
    }
  }

  #updateIframeContents(newContents: string) {
    const iframeDocument = this.iframeEl.contentDocument;
    if (!iframeDocument) {
      return;
    }

    iframeDocument.querySelector('div')!.textContent = newContents;
  }

  render() {
    return html`
      ${this.#renderIframeControls()}
      <iframe @load=${this.#onLoad} src="./my-second-page.html"></iframe>
    `;
  }

  #renderIframeControls() {
    /* playground-fold */
    return html`
      <input
        style="display: block; width: 300px"
        type="text"
        .value=${this.iframeText}
        @input=${(e: Event) => {
          this.iframeText = (e.target as HTMLInputElement).value;
        }}
      />
    `;
  }

  #onLoad() {
    this.#updateIframeContents(this.iframeText);
    /* playground-fold-end */
  }
}
