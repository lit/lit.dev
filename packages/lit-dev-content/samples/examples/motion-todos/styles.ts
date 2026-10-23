import {css} from 'lit';

export const styles = [
  css`
    :host {
      display: inline-block;
      outline: none;
      padding: 8px;
    }

    input[type='text'] {
      display: block;
      margin-top: 16px;
    }

    .controls {
      display: flex;
      padding: 8px 0;
      justify-content: flex-end;
    }

    .lists {
      display: flex;
    }

    .list {
      flex: 1;
    }

    ul {
      margin: 0;
      padding: 0;
      outline: none;
    }

    li {
      will-change: transform;
      position: relative;
      background: #ffeb3b;
      padding: 8px;
      border-radius: 12px;
      margin: 8px;
      display: flex;
      align-items: center;
    }

    li > button {
      border: none;
      background: none;
      outline: none;
      font-size: 24px;
      cursor: pointer;
    }

    li > label {
      flex: 1;
    }

    .list.completed li {
      background: #4caf50;
    }
  `,
];
