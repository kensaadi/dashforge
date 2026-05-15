import { describe, it, expect } from 'vitest';
import {
  defaultTWTheme,
  defaultTWThemeLight,
  defaultTWThemeDark,
} from './defaults.js';

describe('default TW themes', () => {
  describe('shape parity', () => {
    it('both light + dark expose the full TWTheme shape', () => {
      for (const theme of [defaultTWThemeLight, defaultTWThemeDark]) {
        expect(theme.meta).toBeDefined();
        expect(theme.color).toBeDefined();
        expect(theme.spacing).toBeDefined();
        expect(theme.radius).toBeDefined();
        expect(theme.fontSize).toBeDefined();
      }
    });

    it('color scales cover the full tonal range for every role', () => {
      const expectedTones = [
        '50', '100', '200', '300', '400', '500',
        '600', '700', '800', '900', '950',
      ];
      const expectedRoles = [
        'primary', 'secondary', 'success',
        'warning', 'danger', 'info', 'neutral',
      ] as const;

      for (const theme of [defaultTWThemeLight, defaultTWThemeDark]) {
        for (const role of expectedRoles) {
          for (const tone of expectedTones) {
            expect(theme.color[role]).toHaveProperty(tone);
            expect(theme.color[role][tone as keyof typeof theme.color.primary])
              .toMatch(/^#[0-9a-f]{6}$/i);
          }
        }
      }
    });
  });

  describe('meta', () => {
    it('light theme has mode "light"', () => {
      expect(defaultTWThemeLight.meta.mode).toBe('light');
      expect(defaultTWThemeLight.meta.name).toBe('Dashforge TW Light');
    });

    it('dark theme has mode "dark"', () => {
      expect(defaultTWThemeDark.meta.mode).toBe('dark');
      expect(defaultTWThemeDark.meta.name).toBe('Dashforge TW Dark');
    });
  });

  describe('two-themes-swap semantics', () => {
    it('shares brand color scales between light + dark', () => {
      // Brand roles must be identical so component classes like
      // `bg-primary-500` look the same in both modes.
      const brandRoles = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;
      for (const role of brandRoles) {
        expect(defaultTWThemeDark.color[role]).toEqual(defaultTWThemeLight.color[role]);
      }
    });

    it('inverts neutral scale tonally (50 ↔ 950, 100 ↔ 900, …)', () => {
      const tonePairs: Array<[keyof typeof defaultTWThemeLight.color.neutral, keyof typeof defaultTWThemeLight.color.neutral]> = [
        ['50', '950'],
        ['100', '900'],
        ['200', '800'],
        ['300', '700'],
        ['400', '600'],
      ];
      for (const [light, dark] of tonePairs) {
        expect(defaultTWThemeDark.color.neutral[light])
          .toBe(defaultTWThemeLight.color.neutral[dark]);
      }
      // 500 is the axis of symmetry — same in both
      expect(defaultTWThemeDark.color.neutral['500'])
        .toBe(defaultTWThemeLight.color.neutral['500']);
    });

    it('shares spacing/radius/fontSize between modes', () => {
      expect(defaultTWThemeDark.spacing).toEqual(defaultTWThemeLight.spacing);
      expect(defaultTWThemeDark.radius).toEqual(defaultTWThemeLight.radius);
      expect(defaultTWThemeDark.fontSize).toEqual(defaultTWThemeLight.fontSize);
    });
  });

  describe('back-compat alias', () => {
    it('defaultTWTheme equals defaultTWThemeLight (F1 compatibility)', () => {
      expect(defaultTWTheme).toBe(defaultTWThemeLight);
      expect(defaultTWTheme.meta.mode).toBe('light');
    });
  });
});
