import { describe, it, expect } from 'vitest';

import { resolveCalendarKey } from '../keyboard.js';

describe('resolveCalendarKey', () => {
  it('maps arrow keys to focus directions', () => {
    expect(resolveCalendarKey('ArrowUp')).toBe('up');
    expect(resolveCalendarKey('ArrowDown')).toBe('down');
    expect(resolveCalendarKey('ArrowLeft')).toBe('left');
    expect(resolveCalendarKey('ArrowRight')).toBe('right');
  });

  it('maps Enter and Space to select', () => {
    expect(resolveCalendarKey('Enter')).toBe('select');
    expect(resolveCalendarKey(' ')).toBe('select');
    expect(resolveCalendarKey('Spacebar')).toBe('select');
  });

  it('maps Page keys to month navigation', () => {
    expect(resolveCalendarKey('PageDown')).toBe('monthForward');
    expect(resolveCalendarKey('PageUp')).toBe('monthBackward');
  });

  it('returns null for unrelated keys', () => {
    expect(resolveCalendarKey('a')).toBeNull();
    expect(resolveCalendarKey('Tab')).toBeNull();
    expect(resolveCalendarKey('Escape')).toBeNull();
  });
});
