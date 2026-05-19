// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { passesFilter, toNumber, toDateMs } from './useTableFilter.js';

describe('useTableFilter — toNumber', () => {
  it('returns null for null and undefined', () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
  });

  it('returns the value for finite numbers', () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-3.14)).toBe(-3.14);
  });

  it('returns null for non-finite numbers', () => {
    expect(toNumber(Number.NaN)).toBeNull();
    expect(toNumber(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('coerces numeric strings', () => {
    expect(toNumber('42')).toBe(42);
    expect(toNumber('0.5')).toBe(0.5);
  });

  it('returns null for non-numeric strings', () => {
    expect(toNumber('abc')).toBeNull();
  });

  // JS quirk: Number('') === 0 (finite). Empty-string is treated as 0
  // by toNumber. Callers that need open-range semantics (e.g. the
  // NumberRangeFilter UI) explicitly null-out empty inputs before
  // passing them through.
  it('returns 0 for empty string (JS Number("") === 0)', () => {
    expect(toNumber('')).toBe(0);
  });

  it('coerces bigint to number', () => {
    expect(toNumber(10n)).toBe(10);
  });

  it('returns null for objects/arrays/booleans', () => {
    expect(toNumber({})).toBeNull();
    expect(toNumber([])).toBeNull();
    expect(toNumber(true)).toBeNull();
  });
});

describe('useTableFilter — toDateMs', () => {
  it('returns null for null and undefined', () => {
    expect(toDateMs(null)).toBeNull();
    expect(toDateMs(undefined)).toBeNull();
  });

  it('returns epoch ms for Date instances', () => {
    const d = new Date('2026-05-19T00:00:00Z');
    expect(toDateMs(d)).toBe(d.getTime());
  });

  it('parses ISO strings', () => {
    const ms = toDateMs('2026-05-19');
    expect(ms).not.toBeNull();
    expect(new Date(ms!).toISOString()).toContain('2026-05-19');
  });

  it('returns null for invalid date strings', () => {
    expect(toDateMs('not-a-date')).toBeNull();
  });
});

describe('useTableFilter — passesFilter (contains)', () => {
  it('returns true for empty needle (no-op filter)', () => {
    expect(passesFilter('Hello', 'contains', '')).toBe(true);
    expect(passesFilter('Hello', 'contains', '   ')).toBe(true);
  });

  it('matches substring case-insensitively', () => {
    expect(passesFilter('Hello World', 'contains', 'hello')).toBe(true);
    expect(passesFilter('Hello World', 'contains', 'WORLD')).toBe(true);
    expect(passesFilter('Hello World', 'contains', 'xyz')).toBe(false);
  });

  it('stringifies non-string row values for searching', () => {
    expect(passesFilter(42, 'contains', '42')).toBe(true);
    expect(passesFilter(true, 'contains', 'true')).toBe(true);
  });
});

describe('useTableFilter — passesFilter (equals)', () => {
  it('returns true when filter value is null (no-op)', () => {
    expect(passesFilter('anything', 'equals', null)).toBe(true);
  });

  it('does strict equality for booleans', () => {
    expect(passesFilter(true, 'equals', true)).toBe(true);
    expect(passesFilter(false, 'equals', false)).toBe(true);
    expect(passesFilter(true, 'equals', false)).toBe(false);
  });

  it('does strict equality for primitives', () => {
    expect(passesFilter('a', 'equals', 'a')).toBe(true);
    expect(passesFilter('a', 'equals', 'b')).toBe(false);
    expect(passesFilter(1, 'equals', 1)).toBe(true);
  });
});

describe('useTableFilter — passesFilter (between, number range)', () => {
  it('returns true when range is fully open', () => {
    expect(passesFilter(42, 'between', [null, null])).toBe(true);
  });

  it('respects min bound', () => {
    expect(passesFilter(5, 'between', [10, null])).toBe(false);
    expect(passesFilter(10, 'between', [10, null])).toBe(true);
    expect(passesFilter(15, 'between', [10, null])).toBe(true);
  });

  it('respects max bound', () => {
    expect(passesFilter(5, 'between', [null, 10])).toBe(true);
    expect(passesFilter(10, 'between', [null, 10])).toBe(true);
    expect(passesFilter(15, 'between', [null, 10])).toBe(false);
  });

  it('respects both bounds inclusively', () => {
    expect(passesFilter(7, 'between', [5, 10])).toBe(true);
    expect(passesFilter(5, 'between', [5, 10])).toBe(true);
    expect(passesFilter(10, 'between', [5, 10])).toBe(true);
    expect(passesFilter(4, 'between', [5, 10])).toBe(false);
    expect(passesFilter(11, 'between', [5, 10])).toBe(false);
  });

  it('coerces string row values to number', () => {
    expect(passesFilter('7', 'between', [5, 10])).toBe(true);
  });

  it('returns true for malformed filter value (defensive)', () => {
    expect(passesFilter(42, 'between', 'not a tuple')).toBe(true);
    expect(passesFilter(42, 'between', [1])).toBe(true);
  });
});

describe('useTableFilter — passesFilter (between, date range)', () => {
  it('respects ISO date range bounds', () => {
    const row = '2026-05-19';
    expect(passesFilter(row, 'between', ['2026-01-01', '2026-12-31'])).toBe(true);
    expect(passesFilter(row, 'between', ['2026-06-01', '2026-12-31'])).toBe(false);
    expect(passesFilter(row, 'between', ['2026-01-01', '2026-05-01'])).toBe(false);
  });

  it('accepts Date instances as row values', () => {
    const row = new Date('2026-05-19T00:00:00Z');
    expect(passesFilter(row, 'between', ['2026-01-01', '2026-12-31'])).toBe(true);
  });

  it('treats null bounds as open ended', () => {
    expect(passesFilter('2026-05-19', 'between', [null, '2026-12-31'])).toBe(true);
    expect(passesFilter('2026-05-19', 'between', ['2026-01-01', null])).toBe(true);
  });
});

describe('useTableFilter — passesFilter (unknown operator)', () => {
  it('returns true for unrecognized operator (defensive no-op)', () => {
    expect(passesFilter('anything', 'unknownOp', 'anything')).toBe(true);
  });
});
