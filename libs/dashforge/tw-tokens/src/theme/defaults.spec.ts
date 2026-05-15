import { describe, it, expect } from 'vitest';
import { defaultTWTheme } from './defaults.js';

describe('defaultTWTheme (F1 placeholder)', () => {
  it('exposes the full TWTheme shape', () => {
    expect(defaultTWTheme.color).toBeDefined();
    expect(defaultTWTheme.spacing).toBeDefined();
    expect(defaultTWTheme.radius).toBeDefined();
    expect(defaultTWTheme.fontSize).toBeDefined();
  });

  it('color scales cover the full tonal range', () => {
    const expectedTones = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    for (const tone of expectedTones) {
      expect(defaultTWTheme.color.primary).toHaveProperty(tone);
      expect(defaultTWTheme.color.neutral).toHaveProperty(tone);
    }
  });
});
