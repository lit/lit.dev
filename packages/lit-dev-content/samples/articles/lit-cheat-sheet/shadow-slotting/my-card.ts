import {html, LitElement, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-card')
export class MyElement extends LitElement {
  render() {
    return html`
      <div id="vertical">
        <div id="image">
          <slot name="image"></slot>
        </div>
        <div id="content">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
          <slot id="content"></slot>
        </div>
      </div>
    `;
  }

  static styles = css`
    /* playground-fold */
    :host {
      display: flex;
      width: 400px;
      border: 1px solid black;
      border-radius: 1em;
      overflow: hidden;
      font-family: sans-serif;
    }

    slot::slotted(*) {
      margin: 0;
    }

    #vertical,
    #content {
      display: flex;
      flex-direction: column;
    }

    #content {
      padding: 1em;
    }

    #image {
      overflow: hidden;
      max-height: 300px;
    }

    [name='image']::slotted(*) {
      aspect-ratio: 16/9;
      height: 100%;
      width: 100%;
      object-fit: cover;
      object-position: center center;
    }

    [name='title']::slotted(*) {
      font-size: 1.5em;
      font-weight: bold;
      margin-block-end: 0.5em;
    }

    [name='subtitle']::slotted(*) {
      font-size: 1em;
      color: gray;
      margin-block-end: 1em;
    }
    /* playground-fold-end */
  `;
}
