/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

export interface TutorialMetricsOptions {
  idx: number;
  tutorialUrl: string;
  hasRecordedStart: boolean;
  hasRecordedEnd: boolean;
  numSteps: number;
}

export type TutorialMetricEvent =
  | 'tutorial_start'
  | 'tutorial_progress'
  | 'tutorial_end'
  | null;

export const reportTutorialMetrics = ({
  idx,
  tutorialUrl,
  hasRecordedStart,
  hasRecordedEnd,
  numSteps,
}: TutorialMetricsOptions): TutorialMetricEvent => {
  // A user can load a tutorial from a URL at a step that is not 0, hence
  // we should consider whether start has not been recorded already.
  if (idx === 0 || !hasRecordedStart) {
    // The first tutorial step viewed
    window.gtag?.('event', 'tutorial_start', {
      category: 'tutorials',
      event_label: tutorialUrl,
      value: idx,
    });
    return 'tutorial_start';
  } else if (idx !== numSteps - 1 && !hasRecordedEnd) {
    // Tutorial progress
    window.gtag?.('event', 'tutorial_progress', {
      category: 'tutorials',
      event_label: tutorialUrl,
      value: idx,
    });
    return 'tutorial_progress';
  } else if (idx === numSteps - 1 && !hasRecordedEnd) {
    // Reached the final step of the tutorial
    window.gtag?.('event', 'tutorial_end', {
      category: 'tutorials',
      event_label: tutorialUrl,
    });
    return 'tutorial_end';
  }

  return null;
};
