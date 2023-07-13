import {Animate} from '@lit-labs/motion';

export const springy = [
  0, 0.0701, 0.2329, 0.4308, 0.6245, 0.7906, 0.9184, 1.0065, 1.059, 1.0833,
  1.0872, 1.0783, 1.0628, 1.0453, 1.0288, 1.015, 1.0048, 0.9979, 0.994, 0.9925,
  0.9925, 0.9935, 0.9949, 0.9964, 0.9978, 0.999, 0.9998,
];

export const onFrames = (animate: Animate) => {
  const {animatingProperties: props, frames} = animate;
  if (frames === undefined || props === undefined) {
    return frames;
  }
  return [
    frames[0],
    ...springy.map((v) => {
      const frame: Keyframe = {};
      const x = props.left
        ? `translateX(${(props.left as number) * (1 - v)}px)`
        : '';
      const y = props.top
        ? `translateY(${(props.top as number) * (1 - v)}px)`
        : '';
      const sx = props.width
        ? `scaleX(${
            (props.width as number) + (1 - (props.width as number)) * v
          })`
        : '';
      const sy = props.height
        ? `scaleY(${
            (props.height as number) + (1 - (props.height as number)) * v
          })`
        : '';
      frame.transform = `${x} ${y} ${sx} ${sy}`;
      return frame;
    }),
    frames[1],
  ];
};

export const data = [
  {id: 0, value: 'Cats', summary: 'Cats are the very best pets.'},
  {id: 1, value: 'Dogs', summary: 'Dogs have a lot of energy.'},
  {id: 2, value: 'Hippos', summary: 'Hippos are very fat and mean.'},
  {
    id: 3,
    value: 'Elephants',
    summary: 'Elephants are really huge.',
  },
  {
    id: 4,
    value: 'Mosquitoes',
    summary: 'Mosquitoes bite you.',
  },
  {id: 5, value: 'Snakes', summary: 'Snakes are pretty scary.'},
  {id: 6, value: 'Frogs', summary: 'Frogs are amphibious.'},
  {
    id: 7,
    value: 'Alligators',
    summary: 'Alligators sneak up on you.',
  },
  {id: 8, value: 'Cows', summary: 'Cows make good hamburgers.'},
];

export type DataItem = typeof data[number];
