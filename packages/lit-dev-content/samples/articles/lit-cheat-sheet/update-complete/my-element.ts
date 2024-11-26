import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';

@customElement('my-element')
export class MyElement extends LitElement {
  @state() width = 1000;
  @state() sizeInfo = '';
  @query('#text') textEl!: HTMLElement;

  private async updateSize() {
    this.width = Math.random() * 900;

    // Wait for the updateComplete promise to resolve before measuring the text.
    await this.updateComplete;
    const rect = this.textEl.getBoundingClientRect();
    this.sizeInfo = `The width and height of the text is ${rect.width} x ${rect.height} pixels.`;
  }

  render() {
    return html`
    <button @click=${this.updateSize}>Randomize width and calculate size</button>
    <p>${this.sizeInfo}</p>
    <div id="text" style="width:${this.width}px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div id="text">
    `;
  }

  static styles = css`
    #text {
      max-width: 100%;
      border: 1px solid black;
    }
  `;
}
