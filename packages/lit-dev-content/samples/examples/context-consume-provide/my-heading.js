import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';
import {styleMap} from 'lit/directives/style-map.js';
import {ContextConsumer} from '@lit/context';
import {levelContext} from './level-context.js';

export class MyHeading extends LitElement {
  _levelContext = new ContextConsumer(this, {context: levelContext});

  get _tag() {
    const level = this._levelContext.value?.level;
    if (typeof level === 'number' && level >= 0 && level <= 5) {
      return unsafeStatic(`h${level + 1}`);
    } else {
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
