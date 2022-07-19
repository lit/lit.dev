import {createComponent} from '@lit-labs/react';
import {React, SimpleGreeting as SimpleGreetingWC} from './deps.js';

const SimpleGreeting = createComponent(
  React,
  'simple-greeting',
  SimpleGreetingWC,
);

export const App = () => <SimpleGreeting name={'starshine'}></SimpleGreeting>;
