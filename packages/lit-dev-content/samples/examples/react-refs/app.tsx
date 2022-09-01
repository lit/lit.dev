import {React, ReactDOM} from './react.js';
import {createComponent} from '@lit-labs/react';
import {FlyingTriangles as FlyingTrianglesWC} from './flying-triangles.js';

/*
  The <flying-triangles> component is stateful and uncontrolled.

  A stateful component maintains state independent of React.
  Meaning component state must be reconciled with React state.
  This is usually accomplished through refs and callbacks.
  
  <flying-triangles> will dispatch a 'state-change' event when
  component state changes.
  
  The 'state-change' provides React an opportunity to update
  UI data based on the properties and attributes of
  a <flying-triangles> component.
*/

const { useRef, useState, useCallback } = React;

const FlyingTriangles = createComponent(
  React,
  'flying-triangles',
  FlyingTrianglesWC,
  {onPlayingChange: 'playing-change'},
);

export const App = () => {
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Listen for playing-change events
  const onPlayingChange = useCallback(() => {
    setIsPlaying(ref.current?.isPlaying);
  }, []);

  // UI callbacks
  const onPlay = useCallback(() => {
    ref.current?.play();
  }, []);
  const onPause = useCallback(() => {
    ref.current?.pause()
  }, []);

  return (
    <>
      <FlyingTriangles
        ref={ref}
        onPlayingChange={onPlayingChange}>
      </FlyingTriangles>
      <button disabled={isPlaying} onClick={onPlay}>
        play
      </button>
      <button disabled={!isPlaying} onClick={onPause}>
        pause
      </button>
    </>
  );
};

const node = document.querySelector('#app');
const root = ReactDOM.createRoot(node!);

root.render(<App></App>);
