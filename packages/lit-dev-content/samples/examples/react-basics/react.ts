declare global {
  interface Window {
    React: any;
    ReactDOM: any;
  }
}

// https://github.com/facebook/react/issues/10021
const React = window.React;
const ReactDOM = window.ReactDOM;

export { React, ReactDOM };
