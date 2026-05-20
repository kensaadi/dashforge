import { describe, it, expect } from 'vitest';

import {
  compareISODate,
  getTodayISODate,
  isAfterISODate,
  isBeforeISODate,
  isSameISODate,
  isWithinISORange,
} from '../compare.js';

describe('compareISODate', () => {
  it('orders dates chronologically', () => {
    expect(compareISODate('2026-05-20', '2026-05-21')).toBe(-1);
    expect(compareISODate('2026-05-21', '2026-05-20')).toBe(1);
    expect(compareISODate('2026-05-20', '2026-05-20')).toBe(0);
  });

  it('works as an Array.sort comparator', () => {
    const sorted = ['2026-12-01', '2025-01-15', '2026-01-15'].sort(compareISODate);
    expect(sorted).toEqual(['2025-01-15', '2026-01-15', '2026-12-01']);
  });
});

describe('isSameISODate / isBeforeISODate / isAfterISODate', () => {
  it('compares dates', () => {
    expect(isSameISODate('2026-05-20', '2026-05-20')).toBe(true);
    expect(isSameISODate('2026-05-20', '2026-05-21')).toBe(false);
    expect(isBeforeISODate('2026-05-20', '2026-05-21')).toBe(true);
    expect(isBeforeISODate('2026-05-21', '2026-05-20')).toBe(false);
    expect(isAfterISODate('2026-05-21', '2026-05-20')).toBe(true);
  });
});

describe('isWithinISORange', () => {
  it('treats the range as inclusive', () => {
    expect(isWithinISORange('2026-05-20', '2026-05-01', '2026-05-31')).toBe(true);
    expect(isWithinISORange('2026-05-01', '2026-05-01', '2026-05-31')).toBe(true);
    expect(isWithinISORange('2026-05-31', '2026-05-01', '2026-05-31')).toBe(true);
  });

  it('excludes dates outside the range', () => {
    expect(isWithinISORange('2026-04-30', '2026-05-01', '2026-05-31')).toBe(false);
    expect(isWithinISORange('2026-06-01', '2026-05-01', '2026-05-31')).toBe(false);
  });

  it('normalizes reversed bounds', () => {
    expect(isWithinISORange('2026-05-20', '2026-05-31', '2026-05-01')).toBe(true);
  });
});

describe('getTodayISODate', () => {
  it('returns a well-formed ISO date', () => {
    expect(getTodayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
