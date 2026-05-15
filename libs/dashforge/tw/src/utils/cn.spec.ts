import { describe, it, expect } from 'vitest';
import { cn } from './cn.js';

describe('cn (clsx wrapper)', () => {
  it('joins truthy class values', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('flattens conditional objects', () => {
    expect(cn('a', { b: true, c: false }, 'd')).toBe('a b d');
  });
});
