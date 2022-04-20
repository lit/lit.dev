import {html, css, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import {range} from 'lit/directives/range.js';
import {map} from 'lit/directives/map.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    /* playground-fold */
    :host {
      display: block;
      width: 400px;
      height: 400px;
    }
    #board {
      display: grid;
      grid-template-columns: repeat(8, 12.5%);
      grid-template-rows: repeat(8, 12.5%);
      border: 2px solid #404040;
      box-sizing: border-box;
      height: 100%;
    }
    .square {
      padding: 2px;
    }
    .square.black {
      color: #ddd;
      background: black;
    }
    .square.white {
      color: gray;
      background: white;
    }
    /* playground-fold-end */

  `;

  render() {
    return html`
      <p>Let's play a game!</p>
      <div id="board">
        ${map(
          range(8),
          (row) => map(
            range(8),
            (col) => html`
              <div class="square ${(row + col) % 2 ? 'white' : 'black'}">
                ${String.fromCharCode(col + 65 /* A */)}${8 - row}
              </div>
            `
          )
        )}
      </div>
    `;
  }
}
