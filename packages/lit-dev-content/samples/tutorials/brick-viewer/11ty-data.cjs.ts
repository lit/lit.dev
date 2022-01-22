import {TutorialData, TutorialManifest} from '../utils.cjs.js';

export const getData = async (): Promise<TutorialData> => {
  return {
    header: 'Build a Brick Viewer',
    difficulty: "Intermediate",
    size: "medium",
    duration: 70,
    category: "Build",
    imgSrc: 'images/logo-whitebg-padded-1600x800.png',
    imgAlt: 'This is the Lit icon',
    description: `Learn how to build a 3d brick viewer combining
    canvas and the best parts of Web Components!`,
  }
};

export const getManifest = async (): Promise<TutorialManifest> => {
  return {
    "steps": [
      {
        "title": "Build a Brick Viewer"
      },
      {
        "title": "Ya Bricked it!"
      }
    ]
  }
}