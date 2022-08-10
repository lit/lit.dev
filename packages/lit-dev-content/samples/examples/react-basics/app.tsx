import {React} from './react.js';
import {createComponent} from '@lit-labs/react';
import {SimpleGreeting as SimpleGreetingWC} from './simple-greeting.js';

const SimpleGreeting = createComponent(
  React,
  'simple-greeting',
  SimpleGreetingWC
);

export const App = () => <SimpleGreeting name={'React'}></SimpleGreeting>;
