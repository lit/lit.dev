import {css} from 'lit';

export const styles = css`
  :host {
    display: block;
  }
  .clock-face {
    fill: white;
  }
  .minor {
    stroke: #999;
    stroke-width: 0.5;
  }
  .major, .hour, .clock-face {
    stroke: #333;
  }
  .minute {
    stroke: #666;
  }
  .second, .second-counterweight {
    stroke: rgb(180,0,0);
  }
  .second-counterweight {
    stroke-width: 3;
  }
`;
