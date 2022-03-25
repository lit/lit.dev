import {directive, Directive} from 'lit/directive.js';

class TimeAgoDirective extends Directive {

  time!: Date;

  render(time: Date) {
    return time.toDateString();
  }

}

export const timeAgo = directive(TimeAgoDirective);
