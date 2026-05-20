/**
 * Time-of-day string parsing and option-list generation.
 *
 * The canonical stored form is 24-hour `HH:mm`. 12-hour notation is
 * accepted on input and available on output, but is purely a display
 * concern — never the storage format.
 *
 * @module @dashforge/calendar-core/core/time
 */

const MINUTES_PER_DAY = 1440;
const TIME_PATTERN = /^\s*(\d{1,2})\s*[:.]\s*(\d{2})\s*(am|pm)?\s*$/i;

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Parses a time string into the canonical 24-hour `HH:mm` form, or returns
 * `null` if it is not a valid time. Accepts `H:mm` / `HH:mm`, an optional
 * `am`/`pm` suffix, and `.` or `:` as the separator.
 */
export function parseTimeString(input: string): string | null {
  const match = TIME_PATTERN.exec(input);
  if (match === null) {
    return null;
  }
  const [, hourText, minuteText, meridiemText] = match;
  if (hourText === undefined || minuteText === undefined) {
    return null;
  }
  let hours = Number(hourText);
  const minutes = Number(minuteText);
  if (minutes > 59) {
    return null;
  }
  const meridiem = meridiemText?.toLowerCase();
  if (meridiem !== undefined) {
    if (hours < 1 || hours > 12) {
      return null;
    }
    if (meridiem === 'am') {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else if (hours > 23) {
    return null;
  }
  return `${padTwo(hours)}:${padTwo(minutes)}`;
}

/** Minutes-since-midnight for a time string, or `null` if invalid. */
export function timeStringToMinutes(value: string): number | null {
  const parsed = parseTimeString(value);
  if (parsed === null) {
    return null;
  }
  const segments = parsed.split(':');
  return Number(segments[0]) * 60 + Number(segments[1]);
}

/** Formats minutes-since-midnight as a 24-hour `HH:mm` string (wraps at a day). */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized =
    ((Math.trunc(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${padTwo(Math.floor(normalized / 60))}:${padTwo(normalized % 60)}`;
}

/** Configuration for {@link generateTimeOptions}. */
export interface TimeOptionsConfig {
  /** First option, `HH:mm`. Default `"00:00"`. */
  start?: string;
  /** Inclusive upper bound, `HH:mm`. Default `"23:30"`. */
  end?: string;
  /** Step between options, in minutes. Default `30`. */
  stepMinutes?: number;
}

/** Generates an evenly-spaced list of 24-hour `HH:mm` time options. */
export function generateTimeOptions(config: TimeOptionsConfig = {}): string[] {
  const step =
    config.stepMinutes !== undefined && config.stepMinutes > 0 ? config.stepMinutes : 30;
  const start = timeStringToMinutes(config.start ?? '00:00') ?? 0;
  const end = timeStringToMinutes(config.end ?? '23:30') ?? 1410;
  const options: string[] = [];
  for (let minutes = start; minutes <= end; minutes += step) {
    options.push(minutesToTimeString(minutes));
  }
  return options;
}

/**
 * Formats a time string for display. With `hour12`, renders 12-hour
 * notation (e.g. `"2:30 PM"`); otherwise returns the canonical `HH:mm`.
 */
export function formatTime(value: string, options: { hour12?: boolean } = {}): string {
  const parsed = parseTimeString(value);
  if (parsed === null) {
    return value;
  }
  if (options.hour12 !== true) {
    return parsed;
  }
  const segments = parsed.split(':');
  const hours = Number(segments[0]);
  const minutes = Number(segments[1]);
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${padTwo(minutes)} ${period}`;
}
