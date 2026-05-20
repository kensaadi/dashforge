/**
 * Pure calendar-date arithmetic — zero dependencies.
 *
 * `Date` is used only transiently and always in UTC (`Date.UTC`,
 * `getUTC*`), so every result is timezone-independent.
 *
 * @module @dashforge/calendar-core/core/arithmetic
 */
import type { DateParts, WeekDay } from '../types.js';

const DAYS_PER_MONTH: readonly number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** True for Gregorian leap years. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Number of days in a month. `month` is 1-indexed (1–12).
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_PER_MONTH[month - 1] ?? 30;
}

/** Day of week for a date — `0` = Sunday … `6` = Saturday. */
export function getWeekday(parts: DateParts): WeekDay {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() as WeekDay;
}

/** Returns a new date `amount` days after `parts` (negative = before). */
export function addDays(parts: DateParts, amount: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + amount);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

/**
 * Returns a new date `amount` months after `parts` (negative = before).
 * The day is clamped to the target month's length (e.g. Jan 31 + 1 month
 * → Feb 28/29).
 */
export function addMonths(parts: DateParts, amount: number): DateParts {
  const monthIndex = parts.month - 1 + amount;
  const year = parts.year + Math.floor(monthIndex / 12);
  const month = (((monthIndex % 12) + 12) % 12) + 1;
  return { year, month, day: Math.min(parts.day, getDaysInMonth(year, month)) };
}

/** Today's date in the host's local timezone. */
export function getTodayParts(): DateParts {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
