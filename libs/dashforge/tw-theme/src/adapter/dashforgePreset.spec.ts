import { describe, it, expect } from 'vitest';
import { dashforgePreset } from './dashforgePreset.js';

describe('dashforgePreset (F1 placeholder)', () => {
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
