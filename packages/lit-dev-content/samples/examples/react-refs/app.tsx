import {createComponent} from '@lit-labs/react';
import {React} from './react.js';
import {BoidCanvas as BoidCanvasWC} from './boid-canvas.js';

/*
  The BoidCanvas component is stateful and uncontrolled.

  A stateful component maintains state outside of the React ecosystem.
  So component state must be reconciled with React state.
  This is usually accomplished through refs and callbacks.
  
  BoidCanvas will dispatch a 'state-change' event on state changes.
  
  This provides React an opportunity to update app UI based on
  the properties and attributes of a BoidCanvas component.
*/

const {useCallback, useRef, useState} = React;

const BoidCanvas = createComponent(React, 'boid-canvas', BoidCanvasWC, {
  onStateChange: 'state-change',
});

const initialState = {
  isPlaying: false,
  fps: 24,
};

export const App = () => {
  const ref = useRef();
  const [state, setState] = useState(initialState);

  const onPlay = useCallback(() => ref.current?.play(), []);
  const onPause = useCallback(() => ref.current?.pause(), []);
  const onFps = useCallback((e) => {
    if (ref.current === null) return;

    ref.current.fps = e.target.value;
  }, []);

  const onStateChange = useCallback(() => {
    if (ref.current === null) return;

    const {isPlaying, fps} = ref.current;
    setState({isPlaying, fps});
  }, []);

  const isPlayDisabled = state.isPlaying ? true : '';
  const isPauseDisabled = !state.isPlaying ? true : '';

  return (
    <>
      <BoidCanvas ref={ref} onStateChange={onStateChange}></BoidCanvas>
      <div>
        <button disabled={isPlayDisabled} onClick={onPlay}>
          play
        </button>
        <button disabled={isPauseDisabled} onClick={onPause}>
          pause
        </button>
        <input
          type="range"
          min="3"
          max="32"
          value={state.fps}
          onChange={onFps}
        ></input>
      </div>
    </>
  );
};
