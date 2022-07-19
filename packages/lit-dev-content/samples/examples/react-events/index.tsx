import {React, ReactDOM} from './counter-button.js';
import {App} from './app.js';

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);
