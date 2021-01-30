import { LitElement, html, customElement, property } from '@polymer/lit-element';
@customElement('my-element')
class MyElement extends LitElement {
  @property() clicked = '';
  render() {
    return html`
      <div @click="${this._clickHandler}">
        <p><button>Item 1</button></p>
        <p><button>Item 2</button></p>
        <p><button>Item 3</button></p>
      </div>
      <p>Clicked: ${this.clicked}</p>
    `;
  }
  _clickHandler(e) {
    this.clicked = e.target === e.currentTarget ? 'container' : e.target.textContent;
  }
}
