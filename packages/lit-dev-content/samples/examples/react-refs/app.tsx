import type {EventName} from '@lit-labs/react';
import type {WanderBoidState} from './wander-boids.js';

import {createComponent} from '@lit-labs/react';
import {React} from './react.js';
import {WanderBoid as WanderBoidsWC} from './wander-boids.js';

/*
  The WanderBoid component is stateful and uncontrolled.
  So we want to react to changes in it's state.
  We do that through callbacks and refs.

  The WanderBoid component will dispatch component state in an event.
  This provides react an opportunity to update the DOM accordingly.
*/

const {useCallback, useRef, useState} = React;

const WanderBoid = createComponent(React, 'wander-boid', WanderBoidsWC, {
  onWanderBoidState: 'wander-boid-state' as EventName<
    CustomEvent<WanderBoidState>
  >,
});

const initialState: WanderBoidState = {
  isPlaying: false,
  fps: 24,
};

export const App = () => {
  const ref = useRef();
  const [state, setState] = useState(initialState);

  const onPlay = useCallback(() => ref.current?.play(), []);
  const onPause = useCallback(() => ref.current?.pause(), []);
  const onFps = useCallback((e) => {
    if (ref.current !== null) {
      ref.current.fps = e.target.value;
    }
  }, []);

  const onWanderBoidState = useCallback(
    (e: CustomEvent<WanderBoidState>) => {
      e.stopPropagation();
      setState(e.detail);
    },
    []
  );

  const isPlayDisabled = state.isPlaying ? true : '';
  const isPauseDisabled = !state.isPlaying ? true : '';

  return (
    <>
      <WanderBoid
        ref={ref}
        fps={state.fps}
        onWanderBoidState={onWanderBoidState}
      ></WanderBoid>
      <div>
        <button disabled={isPlayDisabled} onClick={onPlay}>
          play
        </button>
        <button disabled={isPauseDisabled} onClick={onPause}>
          pause
        </button>
        <input
          type="range"
          min="6"
          max="35"
          value={state.fps}
          onChange={onFps}
        ></input>
      </div>
    </>
  );
};
