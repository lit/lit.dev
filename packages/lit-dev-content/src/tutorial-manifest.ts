/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

export interface TutorialStep {
  slug: string;
  title: string;
}

export const manifest: {steps: Array<TutorialStep>} = {
  steps: [
    {
      slug: '01-intro',
      title: 'Lit tutorial',
    },
    {
      slug: '02-define',
      title: 'Define a component',
    },
    {
      slug: '03-properties',
      title: 'Properties and expressions',
    },
    {
      slug: '04-events',
      title: 'Declarative event handlers',
    },
    {
      slug: '05-expressions',
      title: 'More expressions',
    },
    {
      slug: '06-template-logic',
      title: 'Template logic',
    },
    {
      slug: '07-styles',
      title: 'Styles',
    },
  ],
};
