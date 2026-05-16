import { describe, it, expect } from 'vitest';
import { dashforgePreset } from './dashforgePreset.js';
import { defaultTWThemeLight, defaultTWThemeDark } from '@dashforge/tw-tokens';

describe('dashforgePreset — shape', () => {
  it('emits a Tailwind preset shape from defaults', () => {
    const preset = dashforgePreset();
    expect(preset.theme.extend.colors).toBeDefined();
    expect(preset.theme.extend.spacing).toBeDefined();
    expect(preset.theme.extend.borderRadius).toBeDefined();
    expect(preset.theme.extend.fontSize).toBeDefined();
  });

  it('uses the data-dash-tw-theme attribute for dark mode', () => {
    const preset = dashforgePreset();
    expect(preset.darkMode).toEqual(['selector', '[data-dash-tw-theme="dark"]']);
  });
});

describe('dashforgePreset — CSS var references (alpha-value support)', () => {
  it('every color shade is wrapped as rgb(var(...) / <alpha-value>)', () => {
    const preset = dashforgePreset();
    const colors = preset.theme.extend.colors as Record<string, Record<string, string>>;
    for (const role of Object.keys(colors)) {
      for (const tone of Object.keys(colors[role])) {
        expect(colors[role][tone]).toMatch(
          /^rgb\(var\(--df-tw-color-[a-z]+-(\d+)\) \/ <alpha-value>\)$/
        );
      }
    }
  });

  it('encodes a specific primary-500 reference correctly', () => {
    const preset = dashforgePreset();
    const colors = preset.theme.extend.colors as Record<string, Record<string, string>>;
    expect(colors['primary']['500']).toBe(
      'rgb(var(--df-tw-color-primary-500) / <alpha-value>)'
    );
  });

  it('spacing values are var(--df-tw-spacing-<slugifiedKey>) refs', () => {
    const preset = dashforgePreset();
    const spacing = preset.theme.extend.spacing as Record<string, string>;
    for (const key of Object.keys(spacing)) {
      // CSS custom property identifiers cannot contain dots — token
      // keys like '0.5' MUST be slugified to '0_5' in the var
      // reference, while the preset OUTPUT key keeps the original
      // dotted form so Tailwind generates the right class name.
      const slug = key.replace(/\./g, '_');
      expect(spacing[key]).toBe(`var(--df-tw-spacing-${slug})`);
    }
  });

  it('borderRadius values are var(--df-tw-radius-<key>) refs', () => {
    const preset = dashforgePreset();
    const radius = preset.theme.extend.borderRadius as Record<string, string>;
    for (const key of Object.keys(radius)) {
      expect(radius[key]).toBe(`var(--df-tw-radius-${key})`);
    }
  });

  it('fontSize values are var(--df-tw-fontSize-<key>) refs', () => {
    const preset = dashforgePreset();
    const fontSize = preset.theme.extend.fontSize as Record<string, string>;
    for (const key of Object.keys(fontSize)) {
      expect(fontSize[key]).toBe(`var(--df-tw-fontSize-${key})`);
    }
  });
});

describe('dashforgePreset — key parity with input theme', () => {
  it('preserves color role + tone keys from defaults', () => {
    const preset = dashforgePreset(defaultTWThemeLight);
    const colors = preset.theme.extend.colors as Record<string, Record<string, string>>;
    expect(Object.keys(colors).sort()).toEqual(
      Object.keys(defaultTWThemeLight.color).sort()
    );
    for (const role of Object.keys(defaultTWThemeLight.color) as Array<keyof typeof defaultTWThemeLight.color>) {
      expect(Object.keys(colors[role]).sort())
        .toEqual(Object.keys(defaultTWThemeLight.color[role]).sort());
    }
  });

  it('produces the same preset for light or dark template (values ignored — keyspace identical)', () => {
    const lightPreset = dashforgePreset(defaultTWThemeLight);
    const darkPreset = dashforgePreset(defaultTWThemeDark);
    // CSS vars don't change between light/dark — only their resolved values do
    // (and that resolution happens at runtime via the provider, not here).
    expect(lightPreset).toEqual(darkPreset);
  });
});
