/**
 * ISO 8601 calendar-date (`YYYY-MM-DD`) parsing and formatting.
 *
 * @module @dashforge/calendar-core/core/iso
 */
import type { DateParts, ISODate } from '../types.js';
import { getDaysInMonth } from './arithmetic.js';

function padNumber(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

/** Formats numeric date parts as an ISO `YYYY-MM-DD` string. */
export function toISODate(parts: DateParts): ISODate {
  return `${padNumber(parts.year, 4)}-${padNumber(parts.month, 2)}-${padNumber(parts.day, 2)}`;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses an ISO `YYYY-MM-DD` string into {@link DateParts}, or returns
 * `null` if the string is malformed or not a real calendar date.
 */
export function parseISODate(value: string): DateParts | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const [, yearText, monthText, dayText] = match;
  if (yearText === undefined || monthText === undefined || dayText === undefined) {
    return null;
  }
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > getDaysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

/** True when `value` is a well-formed, real ISO calendar date. */
export function isValidISODate(value: string): boolean {
  return parseISODate(value) !== null;
}
