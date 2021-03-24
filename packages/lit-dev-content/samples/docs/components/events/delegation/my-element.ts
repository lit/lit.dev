import {LitElement, html}  from 'lit';
import {customElement, property}  from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property() clicked = '';
  protected render() {
    return html`
      <div @click="${this._clickHandler}">
        <p><button>Item 1</button></p>
        <p><button>Item 2</button></p>
        <p><button>Item 3</button></p>
      </div>
      <p>Clicked: ${this.clicked}</p>
    `;
  }
  private _clickHandler(e: Event) {
    this.clicked = e.target === e.currentTarget ?
      'container' : (e.target as HTMLDivElement).textContent!;
  }
}
