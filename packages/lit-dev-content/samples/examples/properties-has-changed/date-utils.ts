/**
 * Returns true if the two dates represent the same
 * year, month, and day.
 */
export function isSameDate(date1?: Date, date2?: Date) {
  return date1?.toLocaleDateString() === date2?.toLocaleDateString();
}

/**
 * Returns a Date object that displays the correct year, month, and day
 * in the local time zone, given a UTC Date object as returned by input type="date".
 */
export function localDateFromUTC(utcDate: Date) {
  return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
}
