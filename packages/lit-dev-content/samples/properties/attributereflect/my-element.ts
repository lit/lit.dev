import {LitElement, html, css, PropertyDeclaration} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Boolean, reflect: true})
  active: boolean = false;

  @property({type: String, reflect: true, defaultValue: 'normal'} as PropertyDeclaration)
  variant!: string|null;

  static styles = css`
    :host {
      display: inline-block; padding: 4px;
    }
    :host([active]) {
      font-weight: 800;
    }
    :host([variant]) {
      outline: 4px solid green;
    }
    :host([variant="special"]) {
      border-radius: 8px; border: 4px solid red;
    }`;

  render() {
    return html`
      <div><label>active: <input type="checkbox"
        .value="${this.active}"
        @change="${(e: Event) => this.active = (e.target! as HTMLInputElement).checked}">
        ${this.active}
      </label></div>
      <div><label>variant: <input type="checkbox"
        .value="${this.variant === 'special'}"
        @change="${(e: Event) => this.variant = (e.target! as HTMLInputElement).checked ? 'special' : 'normal'}">
        ${this.variant}
      </label></div>
    `;
  }
}
