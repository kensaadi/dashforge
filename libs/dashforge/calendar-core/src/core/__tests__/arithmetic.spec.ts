import { describe, it, expect } from 'vitest';

import {
  addDays,
  addMonths,
  getDaysInMonth,
  getTodayParts,
  getWeekday,
  isLeapYear,
} from '../arithmetic.js';

describe('isLeapYear', () => {
  it('applies the Gregorian rule', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2400)).toBe(true);
  });
});

describe('getDaysInMonth', () => {
  it('returns the month length', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
    expect(getDaysInMonth(2026, 4)).toBe(30);
    expect(getDaysInMonth(2026, 5)).toBe(31);
  });

  it('handles February in leap and non-leap years', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });
});

describe('getWeekday', () => {
  it('returns 0 for Sunday and 6 for Saturday', () => {
    expect(getWeekday({ year: 2021, month: 8, day: 1 })).toBe(0);
    expect(getWeekday({ year: 2000, month: 1, day: 1 })).toBe(6);
  });

  it('advances by one per day, modulo 7', () => {
    const base = getWeekday({ year: 2026, month: 5, day: 20 });
    expect(getWeekday({ year: 2026, month: 5, day: 21 })).toBe((base + 1) % 7);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays({ year: 2026, month: 1, day: 31 }, 1)).toEqual({ year: 2026, month: 2, day: 1 });
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
  });

  it('subtracts days, accounting for leap years', () => {
    expect(addDays({ year: 2026, month: 3, day: 1 }, -1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(addDays({ year: 2024, month: 3, day: 1 }, -1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it('adds a week', () => {
    expect(addDays({ year: 2026, month: 5, day: 20 }, 7)).toEqual({
      year: 2026,
      month: 5,
      day: 27,
    });
  });
});

describe('addMonths', () => {
  it('clamps the day to the target month length', () => {
    expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it('crosses year boundaries forward and backward', () => {
    expect(addMonths({ year: 2026, month: 12, day: 15 }, 1)).toEqual({
      year: 2027,
      month: 1,
      day: 15,
    });
    expect(addMonths({ year: 2026, month: 1, day: 15 }, -1)).toEqual({
      year: 2025,
      month: 12,
      day: 15,
    });
  });

  it('handles multi-year offsets', () => {
    expect(addMonths({ year: 2026, month: 6, day: 30 }, -12)).toEqual({
      year: 2025,
      month: 6,
      day: 30,
    });
  });
});

describe('getTodayParts', () => {
  it('returns a plausible calendar date', () => {
    const today = getTodayParts();
    expect(today.month).toBeGreaterThanOrEqual(1);
    expect(today.month).toBeLessThanOrEqual(12);
    expect(today.day).toBeGreaterThanOrEqual(1);
    expect(today.day).toBeLessThanOrEqual(31);
    expect(today.year).toBeGreaterThan(2000);
  });
});
