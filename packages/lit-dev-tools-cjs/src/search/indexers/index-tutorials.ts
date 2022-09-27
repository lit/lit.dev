import path from 'path';
import fs from 'fs/promises';
import {UserFacingPageData} from '../plugin';
import {JSDOM} from 'jsdom';

interface TutorialStep {
  title: string;
  hasAfter?: boolean;
  noSolve?: boolean;
}

interface Tutorial {
  description: string;
  location: string;
  header: string;
  difficulty: string;
  size: string;
  duration: number;
  category: string;
  steps: TutorialStep[];
}

export const indexTutorials = async (
  outputDir: string,
  idOffset = 0
): Promise<UserFacingPageData[]> => {
  // Path to root documentation path, configurable so we can search _dev or _site.
  const TUTORIAL_PATH = path.resolve(
    __dirname,
    // Load the article content itself not the tags pages.
    `../../../../lit-dev-content/${outputDir}/tutorials`
  );

  const tutorialJson: {tutorials: Tutorial[]} = JSON.parse(
    await fs.readFile(path.join(TUTORIAL_PATH, 'tutorials.json'), 'utf-8')
  );

  let id = idOffset;
  const tutorials: UserFacingPageData[] = [];



  for (const tutorial of tutorialJson.tutorials) {
    if (tutorial.category === 'Draft' || !tutorial.category) {
      continue;
    }

    tutorials.push({
      id: ++id,
      objectID: `${id}`,
      title: tutorial.header,
      docType: {
        tag: 'tutorial',
        type: 'Tutorial',
      },
      relativeUrl: `/tutorials/${tutorial.location}/`,
      heading: tutorial.header,
      text: tutorial.description,
    });

    const parentID = id;
    const tutorialPath = path.join(TUTORIAL_PATH, 'content', tutorial.location);
    // get the subdirectories under the tutorialPath
    const stepDirs = (
      await fs.readdir(tutorialPath, {withFileTypes: true})
    ).filter((dirent) => dirent.isDirectory());

    for (let i = 0; i < stepDirs.length; i++) {
      const step = tutorial.steps[i];
      const stepDir = stepDirs[i];
      const htmlContent = await fs.readFile(
        path.join(tutorialPath, stepDir.name, 'index.html'),
        'utf-8'
      );
      const jsdoc = new JSDOM(htmlContent, {contentType: 'text/html'});
      jsdoc.window.document
        .querySelectorAll('figure.CodeMirror')
        .forEach((el) => {
          el.remove();
        });

        tutorials.push({
          id: ++id,
          objectID: `${id}`,
          parentID: `${parentID}`,
          title: tutorial.header,
          docType: {
            tag: 'tutorial',
            type: 'Tutorial',
          },
          relativeUrl: `/tutorials/${tutorial.location}/#${stepDir.name}`,
          heading: step.title,
          text: jsdoc.window.document.body.textContent!,
        });
    }
  }

  return tutorials;
};
