import {createComponent} from "@lit-labs/react";

import {React, ReactDOM, QuickCounter as QuickCounterWC} from "./deps.js";

const QuickCounter = createComponent(
    React,
    'counter-button',
    QuickCounterWC,
);
  
const App = () => {
    return (
        <QuickCounter>
            <button slot="decrease">--</button>
            <button slot="increase">++</button>
        </QuickCounter>
    )
};

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);