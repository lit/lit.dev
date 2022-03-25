import {directive, Part, DirectiveParameters} from 'lit/directive.js';
import {AsyncDirective} from 'lit/async-directive.js';
import {format} from 'timeago.js';

class TimeAgoDirective extends AsyncDirective {

  timer: number | undefined;
  time!: Date;
  frequency!: number;

  render(time: Date, frequency = 1000) {
    return format(time);
  }

  update(part: Part, [time, frequency = 1000]: DirectiveParameters<this>) {
    this.time = time;
    if (this.frequency !== frequency) {
      this.ensureStopped();
      this.frequency = frequency;
    }
    this.ensureStarted();
    return format(time);
  }

  ensureStarted() {
    if (this.timer === undefined) {
      this.timer = setInterval(() => {
        this.setValue(format(this.time));
      }, this.frequency);
    }
  }

  ensureStopped() {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  disconnected() {
    this.ensureStopped();
  }

  reconnected() {
    this.ensureStarted();
  }
}

export const timeAgo = directive(TimeAgoDirective);
