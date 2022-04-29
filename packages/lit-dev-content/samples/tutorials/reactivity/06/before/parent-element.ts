import {LitElement, html, css, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import './list-element.js';

@customElement('parent-element')
export class ParentElement extends LitElement {
  static styles = css`
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  list-element:not([loaded]) {
    opacity: 0;
  }
  list-element[loaded] {
    animation: .5s fadein;
  }
  `;


  lists = [
    ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Ethyl'],
    ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Vincent']
  ];
  @property() currentList = 0;
  @state() _updating = false;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('currentList')) {
      this._updating = true;
    }
  }

  handleUpdated() {
    this._updating = false;
  }

  render() {
    return html`
      <h2>Parent element</h2>
      <button @click=${() => this.currentList = (this.currentList+1)%2}>Switch list</button>
      <list-element .list=${this.lists[this.currentList]}
          @list-updated=${this.handleUpdated}
          ?loaded=${!this._updating}></list-element>

    `;
  }
}
