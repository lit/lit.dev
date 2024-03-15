import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';
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
    switch (this._level?.level) {
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
      <${this._tag} style=${styleMap({color: this._level?.color})}>
        <slot></slot>
      </${this._tag}>`;
  }
}
