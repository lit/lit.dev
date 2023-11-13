/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
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
  if (outputDir === '_dev') {
    return [];
  }

  const TUTORIAL_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/tutorials`
  );

  // Pulls the metadata from all the tutorials rendered by 11ty.
  const tutorialJson: {tutorials: Tutorial[]} = JSON.parse(
    await fs.readFile(path.join(TUTORIAL_PATH, 'tutorials.json'), 'utf-8')
  );

  let id = idOffset;
  const tutorials: UserFacingPageData[] = [];

  for (const tutorial of tutorialJson.tutorials) {
    // Draft tutorials should not be rendered. Also those that are not
    // categorized because they are not rendered.
    if (tutorial.category === 'Draft' || !tutorial.category) {
      continue;
    }

    const parentID = id;

    // Push the tutorial metadata as the parent.
    tutorials.push({
      objectID: `${id++}`,
      title: tutorial.header,
      docType: {
        tag: 'tutorial',
        type: 'Tutorial',
      },
      relativeUrl: `/tutorials/${tutorial.location}/`,
      heading: tutorial.header,
      text: tutorial.description,
    });

    const tutorialPath = path.join(TUTORIAL_PATH, 'content', tutorial.location);

    // get the subdirectories under the tutorialPath which are the steps.
    const stepDirs = (
      await fs.readdir(tutorialPath, {withFileTypes: true})
    ).filter((dirent) => dirent.isDirectory());

    for (let i = 0; i < stepDirs.length; i++) {
      const stepMetadata = tutorial.steps[i];
      const stepDir = stepDirs[i];

      // Get the step's description HTML content.
      const stepContent = await fs.readFile(
        path.join(tutorialPath, stepDir.name, 'index.html'),
        'utf-8'
      );

      const jsdoc = new JSDOM(stepContent, {contentType: 'text/html'});

      // Remove all code samples from the description – they might pollute
      // the search results.
      jsdoc.window.document
        .querySelectorAll('figure.CodeMirror')
        .forEach((el) => {
          el.remove();
        });

      // Add the step as a record with the parent being the tutorial title.
      tutorials.push({
        objectID: `${id++}`,
        parentID: `${parentID}`,
        title: tutorial.header,
        docType: {
          tag: 'tutorial',
          type: 'Tutorial',
        },
        relativeUrl: `/tutorials/${tutorial.location}/#${stepDir.name}`,
        heading: stepMetadata.title,
        text: jsdoc.window.document.body.textContent!,
      });
    }
  }

  return tutorials;
};
