import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {createComponent} from '@lit/react';
import {DemoGreeting as DemoGreetingWC} from './demo-greeting.js';

// Creates a React component from a Lit component
const DemoGreeting = createComponent({
  react: React,
  tagName: 'demo-greeting',
  elementClass: DemoGreetingWC,
});

const root = createRoot(document.getElementById('app')!);

root.render(<DemoGreeting name="React" />);
