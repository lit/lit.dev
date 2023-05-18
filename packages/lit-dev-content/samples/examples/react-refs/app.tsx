import React, {useCallback, useState, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createComponent} from '@lit-labs/react';
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

export const App = () => {
  const ref = useRef<FlyingTrianglesWC>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Listen for playing-change events
  const handlePlayingChange = useCallback(() => {
    setIsPlaying(!!ref.current?.isPlaying);
  }, []);

  return (
    <>
      <FlyingTriangles ref={ref} onPlayingChange={handlePlayingChange} />
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
