export class RatingElement extends HTMLElement {
  rating: number;

  constructor() {
    super();
    this.rating = 0;
  }
  connectedCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const templateContent = document.querySelector<HTMLTemplateElement>('#rating-element-template')!.content;
    const clonedContent = templateContent.cloneNode(true);
    shadowRoot.appendChild(clonedContent);

    this.shadowRoot!.querySelector<HTMLElement>('.rating')!.innerText = `${this.rating}`;
  }
 }

 customElements.define('rating-element', RatingElement);
