/**
 * @license
 * Copyright The Lit Project
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** The effective color mode rendered by the page. */
export type ColorMode = 'light' | 'dark';

export const COLOR_MODE_CHANGE_EVENT = 'litdev-color-mode-change';

interface ThemeState {
  mode: ColorMode;
  mediaQuery: MediaQueryList;
  worker?: SharedWorker;
  port?: MessagePort;
}

interface ThemeWorkerModeMessage {
  type: 'mode';
  mode: ColorMode;
}

const THEME_STATE_KEY = Symbol.for('lit.dev.theme-state');
const THEME_WORKER_PATH = '/js/global/theme-worker.js';

const isColorMode = (value: unknown): value is ColorMode =>
  value === 'light' || value === 'dark';

const getThemeState = () =>
  (
    window as unknown as {
      [THEME_STATE_KEY]?: ThemeState;
    }
  )[THEME_STATE_KEY];

const setThemeState = (state: ThemeState) => {
  (
    window as unknown as {
      [THEME_STATE_KEY]?: ThemeState;
    }
  )[THEME_STATE_KEY] = state;
};

/**
 * Sets the theme on the page given a color mode.
 *
 * @param mode The source color to generate the theme.
 */
function applyColorMode(state: ThemeState, mode: ColorMode) {
  const modeChanged = state.mode !== mode;
  state.mode = mode;
  document.body.classList.remove('light', 'dark', 'auto');
  document.body.classList.add(mode);
  updateMetaColor(mode);

  if (modeChanged) {
    window.dispatchEvent(
      new CustomEvent<ColorMode>(COLOR_MODE_CHANGE_EVENT, {detail: mode})
    );
  }
}

/**
 * Gets the current effective color mode.
 *
 * @return The current color mode.
 */
export function getCurrentMode(): ColorMode {
  return typeof window === 'undefined'
    ? 'light'
    : getThemeState()?.mode ?? getSystemMode();
}

/**
 * Gets the light or dark mode that the system preference resolves to.
 */
export function getSystemMode(): ColorMode {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Updates the `<meta name="theme-color">` tag to match the current color mode.
 *
 * @param mode Mode from which to update the meta color.
 */
export function updateMetaColor(mode: ColorMode) {
  const meta = document.head.querySelector(
    'meta[name="theme-color"]:not([media])'
  );
  if (!meta) {
    return;
  }

  if (mode === 'light') {
    meta?.setAttribute('content', '#fff');
    return;
  }

  meta?.setAttribute('content', '#121212');
}

/**
 * Initializes the page theme and connects it to the ephemeral shared state.
 */
export function initializeTheme() {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !document.body ||
    getThemeState()
  ) {
    return;
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const state: ThemeState = {
    mode: mediaQuery.matches ? 'dark' : 'light',
    mediaQuery,
  };
  setThemeState(state);
  applyColorMode(state, state.mode);

  mediaQuery.addEventListener('change', ({matches}) => {
    const mode = matches ? 'dark' : 'light';
    if (state.port) {
      state.port.postMessage({type: 'system-mode', mode});
    } else {
      applyColorMode(state, mode);
    }
  });

  if (!('SharedWorker' in window)) {
    return;
  }

  try {
    const worker = new SharedWorker(THEME_WORKER_PATH, {
      name: 'lit-dev-theme',
      type: 'module',
    });
    const {port} = worker;
    state.worker = worker;
    state.port = port;

    worker.addEventListener('error', () => {
      if (state.worker === worker) {
        state.worker = undefined;
        state.port = undefined;
      }
    });

    port.addEventListener('message', ({data}: MessageEvent<unknown>) => {
      const message = data as Partial<ThemeWorkerModeMessage>;
      if (message.type !== 'mode' || !isColorMode(message.mode)) {
        return;
      }

      applyColorMode(state, message.mode);
    });
    port.start();
    port.postMessage({type: 'connect', mode: state.mode});
  } catch {
    state.worker = undefined;
    state.port = undefined;
  }
}

/**
 * Sets an explicit mode for the lifetime of the current group of open tabs.
 */
export function setColorMode(mode: ColorMode) {
  initializeTheme();
  const state = getThemeState();
  if (!state) {
    return;
  }

  applyColorMode(state, mode);
  state.port?.postMessage({type: 'set-mode', mode});
}
