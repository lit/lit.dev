/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Run a function if some activity hasn't occured within a time window.
 */
export class Reaper {
  private fn: () => void;
  private timeout: number;
  private timerId?: ReturnType<typeof setTimeout>;
  private pending = 0;

  constructor(fn: () => void, timeout: number) {
    this.fn = fn;
    this.timeout = timeout;
  }

  /**
   * Cancel the timer, preventing the reaping function from running. Returns a
   * function that allows the timer to begin again.
   */
  keepAlive(): () => void {
    this.pending++;
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    return this.endKeepAlive.bind(this);
  }

  private endKeepAlive() {
    this.pending--;
    if (this.pending === 0) {
      this.timerId = setTimeout(this.fn, this.timeout);
    }
  }
}
