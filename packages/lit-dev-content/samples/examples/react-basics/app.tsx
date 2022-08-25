import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {SimpleGreeting as SimpleGreetingWC} from './simple-greeting.js';

const SimpleGreeting = createComponent(
  React,
  'simple-greeting',
  SimpleGreetingWC
);

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<SimpleGreeting name={'React'}></SimpleGreeting>);
