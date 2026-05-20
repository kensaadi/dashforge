/**
 * Month-grid construction.
 *
 * @module @dashforge/calendar-core/core/grid
 */
import type { DateParts, WeekDay } from '../types.js';
import { addDays, getWeekday } from './arithmetic.js';

/** Day cells per week row. */
export const DAYS_IN_WEEK = 7;

/**
 * Week rows in a month grid. Fixed at 6 so the grid never changes height
 * between months (a 6-row grid always covers any month plus its
 * leading/trailing sibling-month days).
 */
export const WEEKS_IN_GRID = 6;

/**
 * Builds the flat day list for a month grid: leading sibling-month days,
 * the month's own days, then trailing sibling-month days — padded to a
 * fixed {@link WEEKS_IN_GRID} × {@link DAYS_IN_WEEK} (42-cell) grid.
 *
 * @param month - 1-indexed month (1–12).
 * @param weekStartDay - the weekday the grid's first column represents.
 */
export function buildMonthGrid(year: number, month: number, weekStartDay: WeekDay): DateParts[] {
  const firstWeekday = getWeekday({ year, month, day: 1 });
  const leadingDays = (firstWeekday - weekStartDay + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  let cursor = addDays({ year, month, day: 1 }, -leadingDays);
  const cells: DateParts[] = [];
  for (let index = 0; index < WEEKS_IN_GRID * DAYS_IN_WEEK; index += 1) {
    cells.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return cells;
}

/** Splits a flat cell list into week rows of {@link DAYS_IN_WEEK}. */
export function chunkIntoWeeks<T>(cells: readonly T[]): T[][] {
  const weeks: T[][] = [];
  for (let index = 0; index < cells.length; index += DAYS_IN_WEEK) {
    weeks.push(cells.slice(index, index + DAYS_IN_WEEK));
  }
  return weeks;
}
