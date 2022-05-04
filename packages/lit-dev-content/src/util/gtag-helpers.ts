/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

export type TutorialMetricsOptions = {
  idx: number;
  tutorialUrl: string;
  hasRecordedStart: boolean;
  hasRecordedEnd: boolean;
  numSteps: number;
};

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
  if (idx === 0 || !hasRecordedStart) {
    window.gtag?.('event', 'tutorial_start', {
      category: 'tutorials',
      event_label: tutorialUrl,
      value: idx,
    });
    return 'tutorial_start';
  } else if (idx !== numSteps - 1 && !hasRecordedEnd) {
    window.gtag?.('event', 'tutorial_progress', {
      category: 'tutorials',
      event_label: tutorialUrl,
      value: idx,
    });
    return 'tutorial_progress';
  } else if (idx === numSteps - 1 && !hasRecordedEnd) {
    window.gtag?.('event', 'tutorial_end', {
      category: 'tutorials',
      event_label: tutorialUrl,
    });
    return 'tutorial_end';
  }

  return null;
};
