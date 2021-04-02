import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('with-lit')
export class WithLit extends LitElement {
  static styles = css`:host { border: 1px dotted #333; }`;

  @property()
  action = '@Build';

  render() {
    return html`<a href=//twitter.com/buildwithlit target=_blank>
        <figure>${this.action}WithLit</figure></a>`;
  }
}