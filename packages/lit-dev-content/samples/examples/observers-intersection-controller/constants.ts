/**
 * Setup and export a random list of shapes for the intersection demo to render.
 */

const COLORS = [
  `#1D2B53`,
  `#7E2553`,
  `#008751`,
  `#AB5236`,
  `#5F574F`,
  `#C2C3C7`,
  `#FF004D`,
  `#FFA300`,
  `#FFEC27`,
  `#00E436`,
  `#29ADFF`,
  `#83769C`,
  `#FF77A8`,
  `#FFCCAA`,
];

const SHAPE_CLASSES = ['square', 'circle', 'triangle', 'triangle-corner'];

/**
 * Create an array of random shapes to render.
 */
function createShapes() {
  return Array.from(Array(75)).map(() => {
    const size = `${Math.random() * 3 + 7.5}vw`;
    const depth = Math.random() - 0.5;
    const zIndex = depth + 0.5;

    return {
      styles: {
        ['--size']: size,
        ['--rotation']: `${Math.random() - 0.5}turn`,
        ['--color']: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: `${Math.random() * 80 + 10}vw`,
        top: `${Math.random() * 750 - 30}vh`,
        'z-index': `${zIndex}`,
        transform: `translateZ(${depth}px)`,
        position: 'absolute',
        'transform-origin': `50%`,
      },
      class: SHAPE_CLASSES[Math.floor(Math.random() * SHAPE_CLASSES.length)],
    };
  });
}

export const SHAPES = createShapes();
