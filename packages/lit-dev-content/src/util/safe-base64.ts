/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Encode the given string to base64url, with support for all UTF-16 code
 * points, and '=' padding omitted.
 *
 * Built-in btoa throws on non-latin code points (>0xFF), so this function first
 * converts the input to a binary UTF-8 string.
 *
 * Outputs base64url (https://tools.ietf.org/html/rfc4648#section-5), where '+'
 * and '/' are replaced with '-' and '_' respectively, so that '+' doesn't need
 * to be percent-encoded (since it would otherwise be mis-interpreted as a
 * space).
 *
 * TODO(aomarks) Make this a method on <playground-project>? It's likely to be
 * needed by other projects too.
 */
export const encodeSafeBase64 = (str: string): string => {
  // Adapted from suggestions in https://stackoverflow.com/a/30106551
  //
  // Example:
  //
  //   [1] Given UTF-16 input: "😃" {D83D DE03}
  //   [2] Convert to UTF-8 escape sequences: "%F0%9F%98%83"
  //   [3] Extract UTF-8 code points, and re-interpret as UTF-16 code points,
  //       creating a string where all code points are <= 0xFF and hence safe
  //       to base64 encode: {F0 9F 98 83}
  const percentEscaped = encodeURIComponent(str);
  const utf8 = percentEscaped.replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  const base64 = btoa(utf8);
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_');
  // Padding is confirmed optional on Chrome 88, Firefox 85, and Safari 14.
  const padIdx = base64url.indexOf('=');
  return padIdx >= 0 ? base64url.slice(0, padIdx) : base64url;
};

/**
 * Decode a string that was encoded with {@link encodeSafeBase64}.
 */
export const decodeSafeBase64 = (base64url: string): string => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const utf8 = atob(base64);
  const percentEscaped = utf8
    .split('')
    .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  const str = decodeURIComponent(percentEscaped);
  return str;
};
