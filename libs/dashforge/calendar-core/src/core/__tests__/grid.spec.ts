import { describe, it, expect } from 'vitest';

import { getWeekday } from '../arithmetic.js';
import { buildMonthGrid, chunkIntoWeeks, DAYS_IN_WEEK, WEEKS_IN_GRID } from '../grid.js';
import { toISODate } from '../iso.js';

describe('buildMonthGrid', () => {
  it('produces a fixed 42-cell grid', () => {
    expect(buildMonthGrid(2026, 5, 0)).toHaveLength(WEEKS_IN_GRID * DAYS_IN_WEEK);
    expect(buildMonthGrid(2026, 2, 0)).toHaveLength(42);
  });

  it('starts the grid on the configured week-start day', () => {
    for (const weekStartDay of [0, 1, 6] as const) {
      const grid = buildMonthGrid(2026, 5, weekStartDay);
      expect(getWeekday(grid[0])).toBe(weekStartDay);
    }
  });

  it('contains every day of the target month', () => {
    const isoSet = new Set(buildMonthGrid(2026, 5, 1).map(toISODate));
    expect(isoSet.has('2026-05-01')).toBe(true);
    expect(isoSet.has('2026-05-15')).toBe(true);
    expect(isoSet.has('2026-05-31')).toBe(true);
  });

  it('pads with leading and trailing sibling-month days', () => {
    const grid = buildMonthGrid(2026, 5, 0);
    // First cell is on/before the 1st; last cell is on/after the 31st.
    expect(toISODate(grid[0]) <= '2026-05-01').toBe(true);
    expect(toISODate(grid[41]) >= '2026-05-31').toBe(true);
  });
});

describe('chunkIntoWeeks', () => {
  it('splits a 42-cell grid into 6 rows of 7', () => {
    const weeks = chunkIntoWeeks(buildMonthGrid(2026, 5, 0));
    expect(weeks).toHaveLength(WEEKS_IN_GRID);
    for (const week of weeks) {
      expect(week).toHaveLength(DAYS_IN_WEEK);
    }
  });

  it('handles arbitrary lengths', () => {
    expect(chunkIntoWeeks([1, 2, 3])).toEqual([[1, 2, 3]]);
    expect(chunkIntoWeeks([])).toEqual([]);
  });
});
