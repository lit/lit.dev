import {format} from 'timeago.js';
import {directive, AsyncDirective} from 'lit/async-directive.js';

class TimeAgoDirective extends AsyncDirective {

  render(time: Date) {
    return format(time);
  }

}

export const timeAgo = directive(TimeAgoDirective);
