import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

declare global {
    interface Window {
        React: any;
        ReactDOM: any;
    }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

export {React, ReactDOM};