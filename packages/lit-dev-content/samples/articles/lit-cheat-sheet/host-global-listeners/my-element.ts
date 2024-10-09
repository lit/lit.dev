import { html, LitElement, isServer } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() focusedWithin = false;
  @state() clickedOutside = false;

  render() {
    return html`
      <button>Focus me!</button>
      ${this.focusedWithin ? html`<p>Something in this component was focused</p>` : ''}
      ${this.clickedOutside ? html`<p>Something was clicked OUTSIDE this component</p>` : ''}
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Only want to do this in the browser since the server doesn't have the
    // concept of events or document.
    if (!isServer) {
      document.addEventListener('click', this.onDocumentClick);
      this.addEventListener('focusin', this.onFocusin);
      this.addEventListener('focusout', this.onFocusout);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (!isServer) {
      // clean up to prevent memory leaks
      document.removeEventListener('click', this.onDocumentClick);
      // Garbage should also take care of removing these, but it's good practice
      this.removeEventListener('focusin', this.onFocusin);
      this.removeEventListener('focusout', this.onFocusout);
    }
  }

  // Should be an arrow function and not a class method to ensure `this` is
  // bound correctly.
  private onFocusin = () => {
    this.focusedWithin = true;
  };

  private onFocusout = () => {
    this.focusedWithin = false;
  };

  private onDocumentClick = (e: MouseEvent) => {
    const path = e.composedPath();
    this.clickedOutside = !path.includes(this);
  };
}