import React from 'https://esm.sh/react@18';
import {createRoot} from 'https://esm.sh/react-dom@18/client';
import {createComponent} from '@lit/react';
import {FlyingTriangles as FlyingTrianglesWC} from './flying-triangles.js';

/*
  The <flying-triangles> component is stateful and uncontrolled.

  A stateful component maintains state independent of React.
  Meaning component state must be reconciled with React state.
  This is usually accomplished through refs and callbacks.
  
  <flying-triangles> will dispatch a 'playing-change' event when
  component state changes.
  
  The 'playing-change' provides React an opportunity to update
  UI data based on the properties and attributes of
  a <flying-triangles> component.
*/

const FlyingTriangles = createComponent({
  react: React,
  tagName: 'flying-triangles',
  elementClass: FlyingTrianglesWC,
  events: {onPlayingChange: 'playing-change'},
});

const App = () => {
  const ref = React.useRef<FlyingTrianglesWC>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <>
      <FlyingTriangles
        ref={ref}
        onPlayingChange={() => {
          setIsPlaying(!!ref.current?.isPlaying);
        }}
      />
      <button disabled={isPlaying} onClick={() => ref.current?.play()}>
        play
      </button>
      <button disabled={!isPlaying} onClick={() => ref.current?.pause()}>
        pause
      </button>
    </>
  );
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
