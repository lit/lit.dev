import {LitElement} from 'lit';
import {html, literal, unsafeStatic} from 'lit/static-html.js';
import {customElement} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {consume} from '@lit/context';
import {levelContext, type Level} from './level-context.js';

@customElement('my-heading')
export class MyHeading extends LitElement {
  // Consume the level and color from parent provider
  @consume({context: levelContext})
  private _level?: Level;

  private get _tag() {
    const level = this._level?.level;
    if (typeof level === 'number' && level >= 0 && level <= 5) {
      return unsafeStatic(`h${level + 1}`);
    } else {
      return literal`p`;
    }
  }

  render() {
    return html`
      <${this._tag} style=${styleMap({color: this._level?.color})}>
        <slot></slot>
      </${this._tag}>`;
  }
}
