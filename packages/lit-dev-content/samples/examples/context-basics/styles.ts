import {css} from 'lit';
export const providerStyles = css`
  slot {
    display: block;
    border: dashed 4px #dadada;
    padding: 0px 10px;
  }

  :host {
    display: block;
    border: solid 4px #adadad;
    padding: 2px;
  }

  h3 {
    margin-top: 0;
  }
`;
