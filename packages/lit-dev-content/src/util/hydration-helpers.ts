/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Calls a function on idleCallback or in 200ms if on Safari. _Note:_ 200ms is
 * what Astro uses for their idle callback fallback.
 * @param hydrationCallback Function to be called on idleCallback.
 */
export const onIdle = (hydrationCallback: () => void) => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(hydrationCallback);
  } else {
    // Safari doesn't have idle callback so just wait 200ms
    setTimeout(hydrationCallback, 200);
  }
};

/**
 * Calls a given function when window.matchMedia matches for the first time.
 *
 * @param queryString Media query string to trigger the callback.
 * @param hydrationCallback Callback to be called when the given media query matches.
 */
export const onMediaQueryOnce = (
  queryString: string,
  hydrationCallback: () => void
) => {
  const query = window.matchMedia(queryString);
  const onQuery = (e: MediaQueryList | MediaQueryListEvent) => {
    if (e.matches) {
      hydrationCallback();
      query.removeEventListener('change', onQuery);
    }
  };

  if (query.matches) {
    onQuery(query);
  } else {
    query.addEventListener('change', onQuery);
  }
};
