import { describe, it, expect } from 'vitest';

import { formatLongDate, formatMonthYear, getMonthNames, getWeekdayNames } from '../locale.js';

describe('getMonthNames', () => {
  it('returns 12 long month names for en-US', () => {
    const names = getMonthNames('en-US');
    expect(names).toHaveLength(12);
    expect(names[0]).toBe('January');
    expect(names[4]).toBe('May');
    expect(names[11]).toBe('December');
  });

  it('supports short names', () => {
    expect(getMonthNames('en-US', 'short')[0]).toBe('Jan');
  });
});

describe('getWeekdayNames', () => {
  it('returns 7 names rotated to the week-start day', () => {
    const sundayFirst = getWeekdayNames('en-US', 0);
    expect(sundayFirst).toHaveLength(7);
    expect(sundayFirst[0]).toBe('Sun');

    const mondayFirst = getWeekdayNames('en-US', 1);
    expect(mondayFirst[0]).toBe('Mon');
    expect(mondayFirst[6]).toBe('Sun');
  });
});

describe('formatMonthYear', () => {
  it('produces a localized month-year label', () => {
    expect(formatMonthYear({ year: 2026, month: 5, day: 1 }, 'en-US')).toBe('May 2026');
  });
});

describe('formatLongDate', () => {
  it('includes weekday, month and year', () => {
    const label = formatLongDate({ year: 2026, month: 5, day: 20 }, 'en-US');
    expect(label).toContain('May');
    expect(label).toContain('2026');
    expect(label).toContain('20');
  });
});
