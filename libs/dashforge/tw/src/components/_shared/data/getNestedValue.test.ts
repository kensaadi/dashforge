import { describe, it, expect } from 'vitest';
import { getNestedValue } from './getNestedValue.js';

describe('getNestedValue', () => {
  it('returns top-level value', () => {
    expect(getNestedValue({ a: 1 }, 'a')).toBe(1);
  });

  it('returns nested value (1 level)', () => {
    expect(getNestedValue({ user: { name: 'Jane' } }, 'user.name')).toBe('Jane');
  });

  it('returns nested value (3 levels)', () => {
    expect(
      getNestedValue({ a: { b: { c: { d: 42 } } } }, 'a.b.c.d'),
    ).toBe(42);
  });

  it('returns undefined when path is empty', () => {
    expect(getNestedValue({ a: 1 }, '')).toBeUndefined();
  });

  it('returns undefined when intermediate segment is null', () => {
    expect(getNestedValue({ user: null as never }, 'user.name')).toBeUndefined();
  });

  it('returns undefined when intermediate segment is undefined', () => {
    expect(getNestedValue({} as { a?: { b?: number } }, 'a.b')).toBeUndefined();
  });

  it('returns undefined when intermediate segment is a primitive', () => {
    expect(getNestedValue({ a: 'hello' }, 'a.b')).toBeUndefined();
  });

  it('preserves zero value (not coerced to undefined)', () => {
    expect(getNestedValue({ a: { b: 0 } }, 'a.b')).toBe(0);
  });

  it('preserves false value', () => {
    expect(getNestedValue({ a: { b: false } }, 'a.b')).toBe(false);
  });

  it('preserves empty string value', () => {
    expect(getNestedValue({ a: { b: '' } }, 'a.b')).toBe('');
  });

  it('returns the full sub-object when path stops mid-tree', () => {
    expect(getNestedValue({ a: { b: { c: 1 } } }, 'a.b')).toEqual({ c: 1 });
  });
});
