/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * This file MUST be CJS to be consumed by 11ty's data system.
 *
 * These files must be in the root of the tutorial directory and called
 * 11ty-data.cjs.(js|ts).
 *
 * They must also export a getData async function and getManifest async fn.
 *
 * Upon creation of one of these files:
 *
 * 1. You must create a set of matching tutorial descriptions at
 *    `/site/tutorials/content/[tutorial-directory-name]/[slug].md`
 *
 * 2. Do a call to `await loadTutorialData('[tutorial-directory-name]')` in
 *    the order that you want it to appear in
 *    `/site/tutorials/tutorials.11tydata.js`
 */
import {TutorialData, TutorialManifest} from '../utils.cjs.js';

/**
 * Generates a tutorial data object for this tutorial's catalog card. For more
 * options, see {@linkcode TutorialData}.
 *
 * @returns Tutorial Data Object that describes this tutorial for the catalog.
 */
export const getData = async (): Promise<TutorialData> => {
  return {
    header: 'Intro to Lit',
    difficulty: "Beginner",
    // When authoring a description you're going to have to manually set the
    // size that fits all your content
    size: "small",
    // In minutes (e.g. 2hrs 10mins == 130)
    duration: 20,
    // Where in the catalog page you want it to appear.
    category: "Learn",
    // Description. Newlines can be inserted with <br/>
    description: `New to Lit? Start here to learn the ropes and make your
    first LitElement`,
  }
};

/**
 * Used to generate a tutorial manifest for the actual tutorial page for setting
 * the step's title text, and for the playground to know what data to load.
 *
 * @returns An object used to generate the tutorial's manifest that is used
 *   by the actual tutorial page.
 */
export const getManifest = async (): Promise<TutorialManifest> => {
  return {
    "steps": [
      {
        "title": "Lit tutorial"
      },
      {
        "title": "Define a component"
      },
      {
        "title": "Properties and expressions"
      },
      {
        "title": "Declarative event listeners"
      },
      {
        "title": "More expressions"
      },
      {
        "title": "Template logic"
      },
      {
        "title": "Styles"
      },
      {
        "title": "Finishing touches"
      }
    ]
  }
}