import {
    React,
    ReactDOM,
    SimpleGreeting as SimpleGreetingComponent,
} from './deps.js';
import { createComponent } from '@lit-labs/react';


const SimpleGreeting = createComponent(
    React,
    'simple-greeting',
    SimpleGreetingComponent,
)

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<SimpleGreeting name={"buster"}></SimpleGreeting>);
