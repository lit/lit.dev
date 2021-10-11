import {css} from 'lit';

export const styles = [
  css`
    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      --size: 50vw;
      width: calc(var(--size) + 80px);
      gap: 8px;
      border-radius: 8px;
      padding: 8px;
      overflow: hidden;
      border: 4px solid #002071;
      background: #e1e2e1;
    }

    .card {
      background: #e1e2e1;
      border-radius: 8px;
      border: 1px solid #002071;
      height: var(--size);
      min-width: var(--size);
      padding: 8px;
      will-change: transform;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: var(--size);
      cursor: pointer;
      user-select: none;
    }
  `,
];
