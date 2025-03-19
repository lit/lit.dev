import {LitElement, html, css, PropertyDeclaration} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  /* playground-fold */ 
  static styles = css`
    :host {
      display: inline-block; 
      padding: 4px;
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
  /* playground-fold-end */  
  @property({type: Boolean, reflect: true})
  active: boolean = false;

  @property({reflect: true, useDefault: true} as PropertyDeclaration)
  variant = 'normal'; 

  render() {
    return html`
      <div><label>active: <input type="checkbox"
        .value="${this.active}"
        @change="${(e: {target: HTMLInputElement}) => 
          this.active = e.target.checked}">
        ${this.active}
      </label></div>
      <div><label>variant: <input type="checkbox"
        .value="${this.variant === 'special'}"
        @change="${(e: {target: HTMLInputElement}) => 
          this.variant = e.target.checked ? 'special' : 'normal'}">
        ${this.variant}
      </label></div>
    `;
  }
}
