/**
 * Localization helpers — month/weekday names and date labels.
 *
 * Everything here is backed by the built-in `Intl.DateTimeFormat`, so there
 * is no hardcoded locale data and no dependency. All formatting is done in
 * UTC to keep results timezone-independent.
 *
 * @module @dashforge/calendar-core/core/locale
 */
import type { DateParts, WeekDay } from '../types.js';

type MonthNameWidth = 'long' | 'short';
type WeekdayNameWidth = 'long' | 'short' | 'narrow';

const MS_PER_DAY = 86_400_000;
/** 2021-08-01 (UTC) is a Sunday — the anchor for weekday-name generation. */
const REFERENCE_SUNDAY_UTC = Date.UTC(2021, 7, 1);

/** Localized month names, January → December (12 entries). */
export function getMonthNames(locale: string, width: MonthNameWidth = 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: width, timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_unused, index) => formatter.format(Date.UTC(2021, index, 1)));
}

/**
 * Localized weekday names (7 entries), rotated so index `0` is
 * `weekStartDay`.
 */
export function getWeekdayNames(
  locale: string,
  weekStartDay: WeekDay,
  width: WeekdayNameWidth = 'short',
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_unused, index) =>
    formatter.format(REFERENCE_SUNDAY_UTC + ((weekStartDay + index) % 7) * MS_PER_DAY),
  );
}

/** A localized "month year" label, e.g. `"May 2026"`. */
export function formatMonthYear(parts: DateParts, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  );
}

/** A localized full date label, e.g. `"Wednesday, 20 May 2026"`. */
export function formatLongDate(parts: DateParts, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(Date.UTC(parts.year, parts.month - 1, parts.day));
}
