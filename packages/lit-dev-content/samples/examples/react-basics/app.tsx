import {createComponent} from '@lit-labs/react';
import {React} from './react.js';
import {SimpleGreeting as SimpleGreetingWC} from './simple-greeting.js';

const SimpleGreeting = createComponent(
  React,
  'simple-greeting',
  SimpleGreetingWC
);

export const App = () => <SimpleGreeting name={'starshine'}></SimpleGreeting>;
