import {React, ReactDOM} from './faux-react.js';
import {App} from './app.js';

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);
