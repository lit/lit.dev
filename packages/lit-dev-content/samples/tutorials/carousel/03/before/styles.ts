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

  ::slotted(*) {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }`;
