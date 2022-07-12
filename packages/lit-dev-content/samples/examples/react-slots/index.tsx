import type {EventName} from "@lit-labs/react";
import {createComponent} from "@lit-labs/react";

import {React, ReactDOM, CountClicker as CountClickerWC} from "./deps.js";

const CountClicker = createComponent(
    React,
    'count-clicker',
    CountClickerWC,
    {onClickCount: 'click-count' as EventName<CustomEvent<number>>},
);

const App = () => {
    const [count, setCount] = React.useState(0);

    const clickCountCallback = React.useCallback((e: CustomEvent<number>) => {
        setCount(e.detail);
    }, [])

    return (
        <>
            <p>Count: {count}</p>
            <CountClicker onClickCount={clickCountCallback}>
                <button slot="decrease">--</button>
                <button slot="increase">++</button>
            </CountClicker>
        </>

    )
};

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);