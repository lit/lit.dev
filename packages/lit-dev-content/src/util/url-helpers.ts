/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Gets the the current value of the given search param from the hash of the
 * current URL.
 *
 * @param name The name of the search param to get.
 * @param hashParams The hash params to search. Defaults to the current hash.
 *    Useful for chaining with mutation operations.
 * @returns The value of the search param, or `null` if it is not present.
 */
export const getHashSearchParam = (
  name: string,
  hashParams = getHashSearchParams()
): string | null => {
  return hashParams.get(name);
};

/**
 * Gets the current URL hash, sets a search param, and returns the new
 * `URLSearchParams` for the hash without updating the URL.
 *
 * @param name The name of the param to set.
 * @param value The value of the param to set.
 * @param hashParams The hash params to mutate. Defaults to the current hash.
 *    Useful for chaining with mutation operations.
 * @returns The current URL Search Params that should be used to update the URL.
 */
export const setHashSearchParam = (
  name: string,
  value: string,
  hashParams = getHashSearchParams()
): URLSearchParams => {
  hashParams.set(name, value);
  return hashParams;
};

/**
 * Gets the current URL hash, removes a URL param, and returns the new
 * `URLSearchParams` for the hash without updating the URL.
 *
 * @param name The name of the param to remove.
 * @param hashParams The hash params to mutate. Defaults to the current hash.
 *    Useful for chaining with mutation operations.
 * @returns The current URL Search Params that should be used to update the URL.
 */
export const deleteHashSearchParam = (
  name: string,
  hashParams = getHashSearchParams()
): URLSearchParams => {
  hashParams.delete(name);
  return hashParams;
};

/**
 * @returns The current URL Search Params that are in the hash.
 */
export const getHashSearchParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.hash.substring(1));
};
