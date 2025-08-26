import {html, LitElement, isServer, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() clickedOutside = false;

  render() {
    return html`
      ${!this.clickedOutside
        ? html`<p>Something was clicked INSIDE this component</p>`
        : ''}
      ${this.clickedOutside
        ? html`<p>Something was clicked OUTSIDE this component</p>`
        : ''}
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Only want to do this in the browser since the server doesn't have the
    // concept of events or document.
    if (!isServer) {
      document.addEventListener('click', this.onDocumentClick);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (!isServer) {
      // clean up to prevent memory leaks
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  // Should be an arrow function and not a class method to ensure `this` is
  // bound correctly.
  private onDocumentClick = (e: MouseEvent) => {
    const path = e.composedPath();
    this.clickedOutside = !path.includes(this);
  };

  static styles = css`
    /* playground-fold */

    :host {
      display: inline-flex;
      border: 1px solid black;
    }
    /* playground-fold-end */
  `;
}
