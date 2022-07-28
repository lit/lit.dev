import {React} from './react.js';
import {createComponent} from '@lit-labs/react';
import {BoidCanvas as BoidCanvasWC} from './boid-canvas.js';

/*
  The BoidCanvas component is stateful and uncontrolled.

  A stateful component maintains state outside of the React ecosystem.
  So component state must be reconciled with React state.
  This is usually accomplished through refs and callbacks.
  
  BoidCanvas will dispatch a 'change' event on state changes.
  
  This provides React an opportunity to update app UI based on
  the properties and attributes of a BoidCanvas component.
*/

const {useCallback, useRef, useState, useEffect} = React;

const BoidCanvas = createComponent(React, 'boid-canvas', BoidCanvasWC);

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
  const onChangeSetState = useCallback(() => {
    if (ref.current === null) return;

    const {isPlaying, fps} = ref.current;
    setState({isPlaying, fps});
  }, []);

  // when app renders and ref changes
  useEffect(() => {
    if (ref.current === null) return;
    const boidCanvas = ref.current;

    // get component state
    const {isPlaying, fps} = boidCanvas;
    setState({isPlaying, fps});

    // update React state on future 'change' events
    boidCanvas.addEventListener('change', onChangeSetState);
    return () => boidCanvas.removeEventListener('change', onChangeSetState);
  }, [ref.current]);

  const isPlayDisabled = state.isPlaying ? true : '';
  const isPauseDisabled = !state.isPlaying ? true : '';

  return (
    <>
      <BoidCanvas ref={ref}></BoidCanvas>
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
