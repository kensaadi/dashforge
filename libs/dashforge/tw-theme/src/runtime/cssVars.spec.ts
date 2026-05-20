import { describe, it, expect } from 'vitest';
import {
  defaultTWThemeLight,
  defaultTWThemeDark,
} from '@dashforge/tw-tokens';
import { hexToRgbTriplet, twThemeCssVars } from './cssVars.js';

describe('hexToRgbTriplet', () => {
  it('converts standard #RRGGBB hex to space-separated triplet', () => {
    expect(hexToRgbTriplet('#3b82f6')).toBe('59 130 246');
    expect(hexToRgbTriplet('#000000')).toBe('0 0 0');
    expect(hexToRgbTriplet('#ffffff')).toBe('255 255 255');
  });

  it('accepts hex without leading "#"', () => {
    expect(hexToRgbTriplet('3b82f6')).toBe('59 130 246');
  });

  it('is case-insensitive', () => {
    expect(hexToRgbTriplet('#3B82F6')).toBe('59 130 246');
    expect(hexToRgbTriplet('#aBcDeF')).toBe('171 205 239');
  });

  it('throws on shorthand #RGB', () => {
    expect(() => hexToRgbTriplet('#abc')).toThrow(/6-digit hex/);
  });

  it('throws on invalid characters', () => {
    expect(() => hexToRgbTriplet('#ggggggg')).toThrow();
    expect(() => hexToRgbTriplet('#12345g')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => hexToRgbTriplet('')).toThrow();
  });
});

describe('twThemeCssVars', () => {
  describe('shape', () => {
    it('emits one CSS var per color role × tone (7 roles × 11 tones = 77 vars)', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      const colorVars = Object.keys(vars).filter((k) => k.startsWith('--df-tw-color-'));
      expect(colorVars).toHaveLength(7 * 11);
    });

    it('emits spacing/radius/fontSize/shadow vars matching slugified token keys', () => {
      // CSS-ident-safe slug: '.' → '_' (see slugifyCssVarKey)
      const slug = (k: string) => k.replace(/\./g, '_');
      const vars = twThemeCssVars(defaultTWThemeLight);
      for (const key of Object.keys(defaultTWThemeLight.spacing)) {
        expect(vars).toHaveProperty(`--df-tw-spacing-${slug(key)}`);
      }
      for (const key of Object.keys(defaultTWThemeLight.radius)) {
        expect(vars).toHaveProperty(`--df-tw-radius-${slug(key)}`);
      }
      for (const key of Object.keys(defaultTWThemeLight.fontSize)) {
        expect(vars).toHaveProperty(`--df-tw-fontSize-${slug(key)}`);
      }
      for (const key of Object.keys(defaultTWThemeLight.shadow)) {
        expect(vars).toHaveProperty(`--df-tw-shadow-${slug(key)}`);
      }
    });
  });

  describe('color encoding', () => {
    it('converts every color value to raw RGB triplet (alpha-value format)', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      for (const [key, value] of Object.entries(vars)) {
        if (key.startsWith('--df-tw-color-')) {
          // Must be three integers 0-255 separated by single spaces — no '#', no 'rgb()'
          expect(value).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
        }
      }
    });

    it('encodes a known primary-500 triplet correctly', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      // #3b82f6 → 59 130 246
      expect(vars['--df-tw-color-primary-500']).toBe('59 130 246');
    });
  });

  describe('non-color encoding', () => {
    it('preserves spacing rem values as-is', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      expect(vars['--df-tw-spacing-0']).toBe('0rem');
      expect(vars['--df-tw-spacing-4']).toBe('1rem');
    });

    it('slugifies dot-containing spacing keys (CSS-ident-safe)', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      // Original token key '0.5' → '--df-tw-spacing-0_5' (dot replaced
      // with underscore so the identifier is valid in CSS).
      expect(vars).toHaveProperty('--df-tw-spacing-0_5');
      expect(vars['--df-tw-spacing-0_5']).toBe('0.125rem');
      // The unsafe variant must NOT appear in the output.
      expect(vars).not.toHaveProperty('--df-tw-spacing-0.5');
    });

    it('preserves radius values including "full" → "9999px"', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      expect(vars['--df-tw-radius-md']).toBe('0.375rem');
      expect(vars['--df-tw-radius-full']).toBe('9999px');
    });

    it('preserves fontSize values', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      expect(vars['--df-tw-fontSize-base']).toBe('1rem');
      expect(vars['--df-tw-fontSize-2xl']).toBe('1.5rem');
    });

    it('preserves shadow box-shadow values as-is', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      expect(vars['--df-tw-shadow-none']).toBe('0 0 #0000');
      expect(vars['--df-tw-shadow-md']).toBe(
        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      );
    });

    it('emits the DEFAULT shadow tier as --df-tw-shadow-DEFAULT', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      // The `DEFAULT` key has no dots — slug is a no-op, the var name
      // keeps the uppercase form. Matches the preset's
      // mapKeysToCssVarRefs(theme.shadow, 'shadow') output.
      expect(vars).toHaveProperty('--df-tw-shadow-DEFAULT');
    });
  });

  describe('light vs dark theme', () => {
    it('produces identical brand color vars but different neutral vars', () => {
      const light = twThemeCssVars(defaultTWThemeLight);
      const dark = twThemeCssVars(defaultTWThemeDark);

      // Brand identical
      expect(light['--df-tw-color-primary-500']).toBe(dark['--df-tw-color-primary-500']);
      expect(light['--df-tw-color-success-500']).toBe(dark['--df-tw-color-success-500']);

      // Neutral inverted at the tonal axis (50 ↔ 950)
      expect(light['--df-tw-color-neutral-50']).toBe(dark['--df-tw-color-neutral-950']);
      expect(light['--df-tw-color-neutral-950']).toBe(dark['--df-tw-color-neutral-50']);

      // Spacing/radius/fontSize unchanged
      expect(light['--df-tw-spacing-4']).toBe(dark['--df-tw-spacing-4']);
      expect(light['--df-tw-radius-md']).toBe(dark['--df-tw-radius-md']);
    });
  });

  describe('full snapshot — regression guard', () => {
    it('matches inline snapshot for defaultTWThemeLight', () => {
      const vars = twThemeCssVars(defaultTWThemeLight);
      // Spot-check key shape rather than full snapshot to avoid noisy diffs
      // on legitimate token tweaks. The full keyspace is asserted in the
      // shape tests above.
      expect(vars['--df-tw-color-primary-50']).toBe('239 246 255');
      expect(vars['--df-tw-color-danger-500']).toBe('239 68 68');
      expect(vars['--df-tw-color-neutral-950']).toBe('10 10 10');
    });

    it('matches inline snapshot for defaultTWThemeDark', () => {
      const vars = twThemeCssVars(defaultTWThemeDark);
      // Dark neutral-50 should be light's neutral-950 (inverted)
      expect(vars['--df-tw-color-neutral-50']).toBe('10 10 10');
      // Brand stays the same
      expect(vars['--df-tw-color-primary-500']).toBe('59 130 246');
    });
  });
});
