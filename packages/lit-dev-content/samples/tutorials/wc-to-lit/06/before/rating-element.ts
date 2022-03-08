export class RatingElement extends HTMLElement {
  private _rating = 0;

  connectedCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const templateContent = document.querySelector<HTMLTemplateElement>('#rating-element-template')!.content;
    const clonedContent = templateContent.cloneNode(true);
    shadowRoot.appendChild(clonedContent);

    this.shadowRoot!.querySelector<HTMLElement>('.rating')!.innerText = `${this.rating}`;
  }

  set rating(value) {
    this._rating = value;

    if (!this.shadowRoot) {
      return;
    }

    const ratingEl = this.shadowRoot.querySelector<HTMLElement>('.rating');

    if (ratingEl) {
      ratingEl.innerText = `${this._rating}`;
    }
  }

  get rating() {
    return this._rating;
  }
 }

 customElements.define('rating-element', RatingElement);
