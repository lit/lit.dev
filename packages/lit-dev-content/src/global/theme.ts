/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** Color mode, either overriding light/dark or the user's preference. */
export type ColorMode = 'light' | 'dark' | 'auto';

/**
 * Sets the theme on the page given a color mode.
 *
 * @param mode The source color to generate the theme.
 * @param isDark Whether or not the theme should be in dark mode.
 */
function applyColorMode(mode: ColorMode) {
  saveColorMode(mode);
  document.body.classList.remove('light', 'dark', 'auto');
  document.body.classList.add(mode);
}

/**
 * Gets the current color mode from localstorage.
 *
 * @return The current color mode.
 */
export function getCurrentMode(): ColorMode {
  return localStorage.getItem('color-mode') as ColorMode;
}

/**
 * Saves the given color mode to localstorage.
 *
 * @param mode The color mode to save to localstorage.
 */
function saveColorMode(mode: ColorMode) {
  localStorage.setItem('color-mode', mode);
}

/**
 * Applies theme-based event listeners such as changing color mode.
 */
export function applyColorThemeListeners() {
  if (!document?.body?.addEventListener) {
    return;
  }
  document.body.addEventListener('change-color-mode', (event) => {
    applyColorMode(event.mode);
  });
}
