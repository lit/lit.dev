/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

interface LitDevErrorOptions {
  message: string;
  heading?: string;
  stack?: string;
}

export class LitDevError extends Error {
  heading?: string;

  constructor(args: LitDevErrorOptions) {
    super(args.message);
    this.heading = args.heading;
    if (args.stack) {
      // Don't clobber our own stack trace with an undefined one.
      this.stack = args.stack;
    }
  }
}

declare global {
  interface WindowEventMap {
    error: CustomEvent<LitDevError>;
  }
}
