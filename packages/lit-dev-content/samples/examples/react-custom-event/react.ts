// https://github.com/facebook/react/issues/10021

declare global {
  interface Window {
    React: any;
    ReactDOM: any;
  }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

export { React, ReactDOM };
