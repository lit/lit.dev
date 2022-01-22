import {TutorialData, TutorialManifest} from '../utils.cjs.js';

export const getData = async (): Promise<TutorialData> => {
  return {
    header: 'Advanced Templating',
    difficulty: "Advanced",
    size: "medium",
    duration: 50,
    category: "Learn",
    imgSrc: 'images/logo-whitebg-padded-1600x800.png',
    imgAlt: 'This is the Lit icon',
    description: `You've learned the basics, now delve into the
    more advanced parts of the Lit templating system!`,
  }
};

export const getManifest = async (): Promise<TutorialManifest> => {
  return {
    "steps": [
      {
        "title": "Advanced Templating!"
      },
      {
        "title": "Yer done!"
      }
    ]
  }
}