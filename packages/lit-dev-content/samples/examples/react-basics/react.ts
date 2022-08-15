declare global {
  interface Window {
    React: any;
    ReactDOM: any;
  }
}

// https://github.com/facebook/react/issues/10021
export const React = window.React;
export const ReactDOM = window.ReactDOM;