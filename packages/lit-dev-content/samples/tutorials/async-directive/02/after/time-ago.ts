import {directive, Directive} from 'lit/directive.js';

class TimeAgoDirective extends Directive {

  render(time: Date) {
    return time.toDateString();
  }

}

export const timeAgo = directive(TimeAgoDirective);
