import { createComponent } from '@lit-labs/react';

import {
    React,
    ReactDOM,
    SimpleGreeting as SimpleGreetingComponent,
} from './deps.js';

const SimpleGreeting = createComponent(
    React,
    'simple-greeting',
    SimpleGreetingComponent,
)

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<SimpleGreeting name={"buster"}></SimpleGreeting>);

