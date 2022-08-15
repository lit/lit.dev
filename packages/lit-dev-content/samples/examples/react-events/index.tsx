import {React, ReactDOM} from './react.js';
import {App} from './app.js';

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<App></App>);
