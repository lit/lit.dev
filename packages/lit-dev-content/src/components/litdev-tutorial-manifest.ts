/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
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
      title: 'Declarative event listeners',
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
    {
      slug: '08-finishing-touches',
      title: 'Finishing touches'
    }
  ],
};
