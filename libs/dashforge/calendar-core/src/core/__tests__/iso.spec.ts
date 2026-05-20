import { describe, it, expect } from 'vitest';

import { isValidISODate, parseISODate, toISODate } from '../iso.js';

describe('toISODate', () => {
  it('formats numeric parts as a zero-padded ISO string', () => {
    expect(toISODate({ year: 2026, month: 5, day: 20 })).toBe('2026-05-20');
    expect(toISODate({ year: 2026, month: 1, day: 1 })).toBe('2026-01-01');
    expect(toISODate({ year: 2026, month: 12, day: 31 })).toBe('2026-12-31');
  });

  it('pads short years', () => {
    expect(toISODate({ year: 7, month: 3, day: 4 })).toBe('0007-03-04');
  });
});

describe('parseISODate', () => {
  it('parses a valid ISO date', () => {
    expect(parseISODate('2026-05-20')).toEqual({ year: 2026, month: 5, day: 20 });
  });

  it('accepts a leap day', () => {
    expect(parseISODate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it('rejects a non-leap 29 February', () => {
    expect(parseISODate('2026-02-29')).toBeNull();
  });

  it('rejects malformed strings', () => {
    expect(parseISODate('2026-5-20')).toBeNull();
    expect(parseISODate('not-a-date')).toBeNull();
    expect(parseISODate('2026/05/20')).toBeNull();
    expect(parseISODate('')).toBeNull();
  });

  it('rejects out-of-range month and day', () => {
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('2026-00-10')).toBeNull();
    expect(parseISODate('2026-04-31')).toBeNull();
    expect(parseISODate('2026-05-00')).toBeNull();
  });

  it('round-trips with toISODate', () => {
    const parsed = parseISODate('2026-07-04');
    expect(parsed).not.toBeNull();
    if (parsed !== null) {
      expect(toISODate(parsed)).toBe('2026-07-04');
    }
  });
});

describe('isValidISODate', () => {
  it('reflects parseISODate', () => {
    expect(isValidISODate('2026-05-20')).toBe(true);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('garbage')).toBe(false);
  });
});
