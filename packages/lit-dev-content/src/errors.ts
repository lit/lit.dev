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

/**
 * Display the given error to the user via the <litdev-error-notifier>
 * component.
 */
export const showError = (error: unknown) => {
  let detail: LitDevError;
  if (error instanceof LitDevError) {
    detail = error;
  } else {
    detail = new LitDevError({
      heading: 'Unexpected error',
      message: (error as Error).message ?? '',
      stack: (error as Error).stack,
    });
  }
  window.dispatchEvent(new CustomEvent('error', {detail}));
};

/**
 * Class method decorator that catches exceptions and forwards them to the
 * <litdev-error-notifier> component so that they will be displayed to the user
 * in a dialog.
 */
export const showErrors =
  () =>
  (_target: unknown, _propertyKey: unknown, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]) {
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            showError(error);
            throw error;
          });
        }
        return result;
      } catch (error: unknown) {
        showError(error);
        throw error;
      }
    };
  };

declare global {
  interface WindowEventMap {
    error: CustomEvent<LitDevError>;
  }
}
