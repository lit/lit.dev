import {render, html} from 'lit';

export class RatingElement extends HTMLElement {
  private _rating = 0;
  private _vote: 'up'|'down'|null = null;

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.render();
  }

  static get observedAttributes() {
    return ['rating'];
  }

  attributeChangedCallback(attributeName: string, _oldValue: string, newValue: string) {
    if (attributeName === 'rating') {
      const newRating = Number(newValue);

      this.rating = newRating;
    }
  }

  set rating(value) {
    this._rating = value;
    this.render();
  }

  get rating() {
    return this._rating;
  }

  set vote(newValue) {
    const oldValue = this._vote;
    if (newValue === oldValue) {
      return;
    }

    if (newValue === 'up') {
      if (oldValue === 'down') {
        this.rating += 2;
      } else {
        this.rating += 1;
      }
    } else if (newValue === 'down') {
      if (oldValue === 'up') {
        this.rating -= 2;
      } else {
        this.rating -= 1;
      }
    }

    this._vote = newValue;
    this.setAttribute('vote', newValue!);
    this.render();
  }

  get vote() {
    return this._vote;
  }

  render() {
    if (!this.shadowRoot) {
      return;
    }

    const template = html`
      <style>
        :host {
          display: inline-flex;
          align-items: center;
        }
        button {
          background: transparent;
          border: none;
          cursor: pointer;
        }

       :host([vote=up]) .thumb_up {
         fill: green;
       }

       :host([vote=down]) .thumb_down {
         fill: red;
       }
      </style>
      <button
          class="thumb_down"
          @click=${() => {this.vote = 'down'}}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewbox="0 0 24 24" width="24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>
      </button>
      <span class="rating">${this.rating}</span>
      <button
          class="thumb_up"
          @click=${() => {this.vote = 'up'}}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewbox="0 0 24 24" width="24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
      </button>`;

    render(template, this.shadowRoot);
  }
 }

 customElements.define('rating-element', RatingElement);
