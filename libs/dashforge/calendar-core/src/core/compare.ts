/**
 * ISO calendar-date comparison.
 *
 * All comparisons are **lexicographic** on the `YYYY-MM-DD` string. This is
 * valid — and dependency-free — because zero-padded ISO date strings sort
 * chronologically under ordinary string ordering.
 *
 * @module @dashforge/calendar-core/core/compare
 */
import type { ISODate } from '../types.js';
import { getTodayParts } from './arithmetic.js';
import { toISODate } from './iso.js';

/** Returns `-1`, `0`, or `1` — usable directly as an `Array.sort` comparator. */
export function compareISODate(a: ISODate, b: ISODate): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/** True when both ISO dates denote the same day. */
export function isSameISODate(a: ISODate, b: ISODate): boolean {
  return a === b;
}

/** True when `a` is strictly before `b`. */
export function isBeforeISODate(a: ISODate, b: ISODate): boolean {
  return a < b;
}

/** True when `a` is strictly after `b`. */
export function isAfterISODate(a: ISODate, b: ISODate): boolean {
  return a > b;
}

/**
 * True when `value` falls within the inclusive `[start, end]` range. The
 * bounds are normalized, so the order of `start`/`end` does not matter.
 */
export function isWithinISORange(value: ISODate, start: ISODate, end: ISODate): boolean {
  const lower = start <= end ? start : end;
  const upper = start <= end ? end : start;
  return value >= lower && value <= upper;
}

/** Today's date (host local timezone) as an ISO `YYYY-MM-DD` string. */
export function getTodayISODate(): ISODate {
  return toISODate(getTodayParts());
}
