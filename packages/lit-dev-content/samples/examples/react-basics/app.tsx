import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {DemoGreeting as DemoGreetingWC} from './demo-greeting.js';

const DemoGreeting = createComponent(
  React,
  'demo-greeting',
  DemoGreetingWC
);

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<DemoGreeting name={'React'}></DemoGreeting>);
