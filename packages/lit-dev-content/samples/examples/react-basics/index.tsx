import {createComponent} from '@lit-labs/react';

import {React, ReactDOM, SimpleGreeting as SimpleGreetingWC} from './deps.js';

const SimpleGreeting = createComponent(
  React,
  'simple-greeting',
  SimpleGreetingWC
);

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<SimpleGreeting name={'starshine'}></SimpleGreeting>);
