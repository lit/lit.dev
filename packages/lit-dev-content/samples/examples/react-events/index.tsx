import {React, ReactDOM, Button} from "./deps.js";
import {createComponent} from "@lit-labs/react";

const MWCButton = createComponent(
    React,
    'demo-button',
    Button,
)

const App = () => {
    const [count, setCount] = React.useState(0);

    const clickCallback = React.useCallback((e) => {
        setCount(count + 1);
    }, [count, setCount])

    return (
        <>
            <div>There have been {count} clicks!</div>
            <MWCButton
                onClick={clickCallback}
                outlined="${true}">Increase count ++</MWCButton>
        </>
    )
};

const section = document.querySelector('section');
const root = ReactDOM.createRoot(section!);

root.render(<App></App>);