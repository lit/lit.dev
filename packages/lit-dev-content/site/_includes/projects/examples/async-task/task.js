import { UpdatingElement } from 'lit-element';

/**
 * Computes a value asynchronously and caches it, making it avaiable
 * synchronously.
 *
 * CachedTask notifies an UpdatingElement implementation when its value has
 * changed.
 */
export class Task {
  _host;
  _compute;
  _getDeps;
  _deps;

  _state; // undefined | 'pending' | 'complete' | 'error'
  _value;
  _error;

  constructor(host, compute, getDeps) {
    this._host = host;
    this._compute = compute;
    this._getDeps = getDeps;
  }

  /**
   * Calls one of the given render functions based on the state of the Task
   *
   * Example
   *
   * task.render({
   *   complete: (v) => html`value: ${v}`,
   *   error: (e) => html`error: ${e}`,
   *   pending: (v) => html`Loading...`,
   *   initial: (v) => html`not started`,
   * })
   */
  render(renderFunctions) {
    this._maybeCompute();
    if (this._state === 'complete') {
      return renderFunctions.complete && renderFunctions.complete(this._value);
    }
    if (this._state === 'error') {
      return renderFunctions.error && renderFunctions.error(this._error);
    }
    if (this._state === 'pending') {
      return renderFunctions.pending && renderFunctions.pending();
    }
    return renderFunctions.initial && renderFunctions.initial();
  }

  /**
   * Gets the current value of the task, or undefined if the task is computing.
   *
   * Triggers computation of the task if it hasn't been computed before, or if
   * the dependencies have changed.
   */
  get value() {
    this._maybeCompute();
    return this._state = 'complete' ? this._value : undefined;
  }

  _maybeCompute() {
    // By default, compute the first time
    let doCompute = this._state === undefined;

    // If a getDeps function was provided, call it and check if the dependencies
    // have changed. If so, recompute.
    if (this._getDeps !== undefined) {
      const oldDeps = this._deps;
      const newDeps = this._getDeps();
      this._deps = newDeps;

      // Check that we have new or old deps
      if (oldDeps !== undefined || newDeps !== undefined) {
        // If new or old deps are missing, or the array length is different
        // reomcpute
        if (oldDeps === undefined || newDeps === undefined ||
              oldDeps.length !== newDeps.length) {
          doCompute = true;
        } else {
          // Check each dependency using strict equality
          for (let i = 0; i < newDeps.length; i++) {
            if (oldDeps[i] !== newDeps[i]) {
              doCompute = true;
              break;
            }
          }
        }
      }
    }
    if (doCompute) {
      this._computeValue();
    }
  }

  async _computeValue() {
    // Make sure we're not returning stale values while computing.
    // TODO: are there times when we _do_ want to return the stale value?
    //       Should that be an option?
    this._state = 'pending';
    this._value = undefined;
    this._error = undefined;

    // Fire an event so ancestor elements know there's pending work
    let resolve;
    let reject;
    const pendingPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    })
    // https://github.com/justinfagnani/pending-state-protocol
    const pendingEvent = new CustomEvent('pending-state', {
      composed: true,
      bubbles: true,
      detail: {promise: pendingPromise}
    });
    this._host.dispatchEvent(pendingEvent);

    try {
      this._value = await this._compute(...(this._deps || []));
      this._state = 'complete';
      resolve(this._value);
    } catch (e) {
      if (e instanceof InitialStateError) {
        this._state = 'initial';
        resolve();
      }
      this._error = e;
      this._state = 'error';
      reject(e);
    }
    // Make the host re-render
    this._host.requestUpdate();
  }
}

export class InitialStateError extends Error {}
