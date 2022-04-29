import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

@customElement('list-element')
export class ListElement extends LitElement {
  static styles = css`
    .item {
      border: 1px solid grey;
      margin-bottom: 10px;
      width: 50vw;
    }
    .number {
      display: inline-block;
      padding: 10px;
      color: white;
      background-color: blue;
    }
    .text {
      padding: 10px;
      margin-left: 10px;
    }
  `;

  @property()
  list: Array<string> = [];

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('list')) {
      this.updateComplete.then(() =>
        setTimeout(() => {
          this.dispatchEvent(new Event('list-updated'))
        }, 500)
      );
    }
  }

  render() {
    return html`
      ${map(this.list, (item, index ) =>
          html`<div class="item">
            <div class="number">${index}</div>
            <div class="text">${item}</div>
          </div>`
        )}
    `;
  }
}
