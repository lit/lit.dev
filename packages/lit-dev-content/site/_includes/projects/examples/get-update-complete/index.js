import { LitElement, html, css } from 'lit-element';

class OuterElement extends LitElement {
  render() {
    return html`
      <inner-element></inner-element>
    `;
  }

  async firstUpdated() {
    const innerEl = this.shadowRoot.querySelector('inner-element');
    console.log('awaiting inner updateComplete...')

    await innerEl.updateComplete;
    console.log('inner updateComplete awaited!')
  }

  _getUpdateComplete() {
    const innerEl = this.shadowRoot.querySelector('inner-element');
    return Promise.all[this._updatePromise, innerEl.updateComplete];
  }
}

class InnerElement extends LitElement {
  render() {
    return html`<div>Hello World</div>`;
  }
}

customElements.define('outer-element', OuterElement);
customElements.define('inner-element', InnerElement);

const outerEl = document.body.querySelector('outer-element');

(async () => {
  console.log('awaiting outer updateComplete...');
  await outerEl.updateComplete;
  console.log('outer updateComplete awaited!')
})()
