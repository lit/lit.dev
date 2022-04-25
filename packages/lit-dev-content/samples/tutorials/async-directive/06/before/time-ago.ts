import {format} from 'timeago.js';
import {directive, AsyncDirective} from 'lit/async-directive.js';
import {Part, DirectiveParameters} from 'lit/directive.js';

class TimeAgoDirective extends AsyncDirective {

  timer: number | undefined;

  render(time: Date) {
    return format(time);
  }

  update(part: Part, [time]: DirectiveParameters<this>) {
    if (this.isConnected) {
      this.ensureTimerStarted();
    }
    return this.render(time);
  }

  ensureTimerStarted() {
    if (this.timer === undefined) {
      this.timer = setInterval(() => {
        /* do some periodic work */
      }, 1000);
    }
  }

}

export const timeAgo = directive(TimeAgoDirective);
