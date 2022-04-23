import {css} from 'lit';

export const styles = [
  css`
    :host {
      display: inline-flex;
      overflow: hidden;
      /* Defaults */
      width: 200px;
      height: 200px;
      border-radius: 4px;
      background: gainsboro;
      cursor: pointer;
      /* Styling API */
      --item-padding: 4px;
    }

    .mover {
      position: relative;
      box-sizing: border-box;
      min-width: 300%;
      display: flex;
      padding: calc(var(--item-padding) / 2);
      gap: var(--item-padding);
    }

    .item {
      display: flex;
      flex: 1;
    }

    ::slotted(*) {
      flex: 1;
    }
  `,
];
