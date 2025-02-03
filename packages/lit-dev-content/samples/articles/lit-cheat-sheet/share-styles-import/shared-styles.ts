import { css } from 'lit';

export const sharedStyles = css`
  :host {
    display: block;
    border: 1px solid black;
    padding: 8px;
    margin-block: 4px;
  }

  code {
    font-family: monospace;
    background-color: #f4f4f4;
    padding: 2px;
    border-radius: 3px;
  }
`;