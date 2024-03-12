import {LitElement} from 'lit';
import {html, literal} from 'lit/static-html.js';
import {customElement} from 'lit/decorators.js';
import {consume} from '@lit/context';
import {levelContext} from './level-context.js';

@customElement('my-heading')
export class MyHeading extends LitElement {
  @consume({context: levelContext})
  private _level: number | undefined;

  private get _tag() {
    switch (this._level) {
      case 1:
        return literal`h1`;
      case 2:
        return literal`h2`;
      case 3:
        return literal`h3`;
      case 4:
        return literal`h4`;
      case 5:
        return literal`h5`;
      case 6:
        return literal`h6`;
      default:
        return literal`p`;
    }
  }

  render() {
    return html`<${this._tag}><slot></slot></${this._tag}>`;
  }
}
