import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';
import {styleMap} from 'lit/directives/style-map.js';
import {ContextConsumer} from '@lit/context';
import {levelContext} from './level-context.js';

export class MyHeading extends LitElement {
  _levelContext = new ContextConsumer(this, {context: levelContext});

  get _tag() {
    switch (this._levelContext.value?.level) {
      case 0:
        return literal`h1`;
      case 1:
        return literal`h2`;
      case 2:
        return literal`h3`;
      case 3:
        return literal`h4`;
      case 4:
        return literal`h5`;
      case 5:
        return literal`h6`;
      default:
        return literal`p`;
    }
  }

  render() {
    return html`
      <${this._tag}
        style=${styleMap({color: this._levelContext.value?.color})}
      >
        <slot></slot>
      </${this._tag}>`;
  }
}
customElements.define('my-heading', MyHeading);
