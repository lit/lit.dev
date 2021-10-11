import {css} from 'lit';

export const styles = [
  css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: #040424;
      cursor: pointer;
    }

    .letter {
      flex: 1;
      font-size: 30vw;
      text-align: center;
      will-change: transform;
      background: linear-gradient(
        0deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(9, 33, 121, 1) 35%,
        rgba(0, 212, 255, 1) 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .info {
      position: absolute;
      right: 2px;
      bottom: 2px;
    }
  `,
];
