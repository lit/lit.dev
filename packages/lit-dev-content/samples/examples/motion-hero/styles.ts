import {css} from 'lit';

export const styles = [
  css`
    :host {
      display: flex;
      color: #040424;
      height: 100%;
      overflow: hidden;
      justify-content: center;
      --card-color: #546e7a;
      --card-text-color: white;
      --detail-color: #819ca9;
      --detail-text-color: black;
      --accent-color: #29434e;
      --divider: 2px solid var(--accent-color);
      --border: 8px solid var(--accent-color);
      --border-radius: 8px;
    }

    * {
      box-sizing: border-box;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }

    .fit {
      position: absolute;
      inset: 0;
    }

    .icon {
      font-family: 'Material Icons';
      font-style: normal;
      color: var(--accent-color);
    }

    .divider {
      will-change: opacity;
      border-bottom: var(--divider);
    }

    .divider-top {
      will-change: opacity;
      border-top: var(--divider);
    }

    .container {
      width: 800px;
      position: relative;
    }

    .cards {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
    }

    li {
      will-change: transform;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 1;
      flex-basis: 30%;
      cursor: pointer;
      margin: 8px;
      padding: 16px;
      border-radius: var(--border-radius);
      background: var(--card-color);
      color: var(--card-text-color);
    }

    .card-background {
      will-change: opacity;
      border-radius: var(--border-radius);
      border: var(--border);
    }

    .card-icon {
      will-change: transform;
      font-size: 9em;
      text-align: center;
      margin: 8px 0;
    }

    .card-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-header {
      padding-top: 8px;
      min-height: 40px;
    }

    .card-header-title {
      font-weight: 800;
    }

    .detail {
      will-change: transform;
      display: flex;
      flex-direction: column;
      flex: 1;
      color: var(--detail-text-color);
      margin: 8px;
      padding: 16px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--detail-color);
      border-radius: var(--border-radius);
      border: var(--border);
    }

    .detail-header {
      display: flex;
      align-items: center;
    }

    .detail-header-title {
      font-weight: 800;
    }

    .hero-text {
      will-change: transform;
      display: inline-block;
      width: 218px;
    }

    .detail-header-text {
      margin-left: 8px;
    }

    .detail-header-icon {
      will-change: transform;
      font-size: 3em;
      min-width: 48px;
    }

    .detail-content {
      padding: 16px;
      font-size: 1.1em;
      line-height: 200%;
    }
  `,
];
