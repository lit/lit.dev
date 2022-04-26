import {css} from 'lit';

export const styles = css`
  :host {
    display: inline-block;
    overflow: hidden;
    position: relative;
    /* Defaults */
    width: 200px;
    height: 200px;
    border-radius: 4px;
    background: gainsboro;
    cursor: pointer;
  }

  .fit {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .selected {
    top: -100%;
  }

  ::slotted(*) {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }

  .bar {
    position: absolute;
    bottom: 8px;
    width: calc(100% - 16px);
    left: 8px;
    height: 8px;
    background: rgba(200, 200, 200, 0.5);
    border-radius: 8px;
    pointer-events: none;
  }

  .indicator {
    position: relative;
    display: inline-block;
    height: 100%;
    width: 8px;
    border-radius: 8px;
    background: #eee;
  }`;
