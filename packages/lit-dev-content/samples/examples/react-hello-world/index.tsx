import {
    React,
    ReactDOM,
    SimpleGreeting,
} from './deps.js';

import { createComponent } from '@lit-labs/react';

const Greeting = createComponent(
    React,
    'simple-greeting',
    SimpleGreeting,
)

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<Greeting name={"wonderful"}></Greeting>);
