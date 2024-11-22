export function getTagName() {
  return 'div';
}

export function getActiveAttribute() {
  return 'fancy-button--active';
}

export function getClasses() {
  return 'fancy-button';
}

export function getPluginStyles() {
  return `
  .fancy-button {
    position: relative;
    display: inline-flex;
    background-color: lightblue;
    border: 1px solid blue;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    outline: none;
    justify-content: center;
    align-items: center;
  }

  .fancy-button:hover {
    background-color: lightgreen;
  }

  .fancy-button::before {
    position: absolute;
    inset: -5px;
  }

  .fancy-button:focus::before {
    content: '';
    border: 2px solid green;
  }

  .fancy-button:focus {
    background-color: green;
  }

  .fancy-button:active {
    background-color: lightcoral;
  }

  .fancy-button[fancy-button--active]::before {
    content: '';
    border: 2px solid lightcoral;
  }

  .fancy-button > * {
    margin: 0;
  }
`;
}
