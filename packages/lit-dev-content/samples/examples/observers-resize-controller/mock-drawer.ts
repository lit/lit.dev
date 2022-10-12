import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

// Material icon: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Aunfold_more%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4048
const unfold_more = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="white"
  height="48"
  width="48"
  viewBox="0 0 48 48"
>
  <path
    xmlns="http://www.w3.org/2000/svg"
    d="m24 42-9-9 2.2-2.2 6.8 6.8 6.8-6.8L33 33Zm-6.8-24.6L15 15.2l9-9 9 9-2.2 2.2-6.8-6.8Z"
  />
</svg>`;

// Material icon: https://fonts.google.com/icons?selected=Material%20Symbols%20Outlined%3Aunfold_less%3AFILL%400%3Bwght%40400%3BGRAD%400%3Bopsz%4048
const unfold_less = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="white"
  height="48"
  width="48"
  viewBox="0 0 48 48"
>
  <path
    d="M17.15 40 15 37.85l9-9 9 9L30.85 40 24 33.15ZM24 19.15l-9-9L17.15 8 24 14.85 30.85 8 33 10.15Z"
  />
</svg>`;

/**
 * `mock-drawer` imitates a menu on the page. Clicking this drawer expands and
 * contracts it.
 */
@customElement('mock-drawer')
export class MockDrawer extends LitElement {
  @state() extended = false;

  toggleExtended() {
    this.extended = !this.extended;
  }

  render() {
    return html`
      <div
        style=${styleMap({width: this.extended ? '200px' : '50px'})}
        @click=${this.toggleExtended}
      >
        ${this.extended ? unfold_less : unfold_more}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      height: calc(100vh - 90px);
    }
    div {
      background-color: #324fff;
      transition: width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: end;
    }
    div:hover {
      background-color: #101ccc;
    }
    svg {
      rotate: 90deg;
    }
  `;
}
