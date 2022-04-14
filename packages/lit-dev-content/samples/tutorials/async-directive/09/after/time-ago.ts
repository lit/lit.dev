import {format} from 'timeago.js';
import {directive, AsyncDirective} from 'lit/async-directive.js';
import type {Part, DirectiveParameters} from 'lit/directive.js';

class TimeAgoDirective extends AsyncDirective {

  timer: number | undefined;
  time!: Date;

  render(time: Date) {
    return format(time);
  }

  update(part: Part, [time]: DirectiveParameters<this>) {
    this.time = time;
    if (this.isConnected) {
      this.ensureTimerStarted();
    }
    return this.render(time);
  }

  ensureTimerStarted() {
    if (this.timer === undefined) {
      this.timer = setInterval(() => {
        this.setValue(this.render(this.time));
      }, 1000);
    }
  }

  ensureTimerStopped() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  disconnected() {
    this.ensureTimerStopped();
  }

  reconnected() {
    this.ensureTimerStarted();
  }

}

export const timeAgo = directive(TimeAgoDirective);
