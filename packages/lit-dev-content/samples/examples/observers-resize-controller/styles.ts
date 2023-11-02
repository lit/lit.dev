import {css, html} from 'lit';

export const styles = css`
  :host {
    display: grid;
    min-height: 100px;
    width: 100%;
    height: 100%;
    font-size: 1.4rem;
  }

  * {
    grid-area: 1 / 1 / 1 / 1;
  }

  span {
    align-self: center;
    justify-self: center;
    color: white;
    background-color: #324fff;
  }

  svg {
    color: #324fff;
    border: 5px solid #324fff;
    max-height: calc(100vh - 100px);
    width: 100%;
  }
`;

export const svgCross = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    preserveAspectRatio="none"
    viewBox="0 0 100 100"
  >
    <line
      x1="0"
      y1="0"
      x2="100"
      y2="100"
      stroke="currentColor"
      stroke-width="5px"
      vector-effect="non-scaling-stroke"
    />
    <line
      x1="0"
      y1="100"
      x2="100"
      y2="0"
      stroke="currentColor"
      stroke-width="5px"
      vector-effect="non-scaling-stroke"
    />
  </svg>
`;
