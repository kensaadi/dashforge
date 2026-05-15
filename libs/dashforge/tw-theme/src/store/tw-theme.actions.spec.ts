// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  defaultTWThemeLight,
  defaultTWThemeDark,
} from '@dashforge/tw-tokens';

function freshImport() {
  vi.resetModules();
  return Promise.all([
    import('./tw-theme.actions.js'),
    import('./tw-theme.store.js'),
  ]).then(([actions, store]) => ({ ...actions, ...store }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('replaceTheme', () => {
  it('replaces the entire active theme', async () => {
    const { twThemeStore, replaceTheme } = await freshImport();
    replaceTheme(defaultTWThemeDark);
    expect(twThemeStore.meta).toEqual(defaultTWThemeDark.meta);
    expect(twThemeStore.color.neutral['50']).toBe(defaultTWThemeDark.color.neutral['50']);
  });

  it('behaves equivalently to setTheme', async () => {
    const { twThemeStore, replaceTheme, setTheme } = await freshImport();

    replaceTheme(defaultTWThemeDark);
    const afterReplace = JSON.stringify(twThemeStore);

    setTheme(defaultTWThemeLight);
    setTheme(defaultTWThemeDark);
    const afterSet = JSON.stringify(twThemeStore);

    expect(afterReplace).toBe(afterSet);
  });
});

describe('patchTheme — deep merge', () => {
  it('overrides a single nested color triplet without dropping siblings', async () => {
    const { twThemeStore, patchTheme } = await freshImport();
    const originalPrimary400 = twThemeStore.color.primary['400'];

    patchTheme({
      color: {
        primary: {
          '500': '#9333ea',
        },
      },
    });

    expect(twThemeStore.color.primary['500']).toBe('#9333ea');
    // Sibling tones must remain intact (deep merge, not shallow replace)
    expect(twThemeStore.color.primary['400']).toBe(originalPrimary400);
  });

  it('preserves untouched top-level fields', async () => {
    const { twThemeStore, patchTheme } = await freshImport();
    const originalSpacing = { ...twThemeStore.spacing };
    const originalFontSize = { ...twThemeStore.fontSize };

    patchTheme({
      color: { secondary: { '500': '#abcdef' } },
    });

    expect(twThemeStore.spacing).toEqual(originalSpacing);
    expect(twThemeStore.fontSize).toEqual(originalFontSize);
    expect(twThemeStore.meta.mode).toBe('light'); // unchanged
  });

  it('replaces meta fields wholesale (string leaves)', async () => {
    const { twThemeStore, patchTheme } = await freshImport();
    patchTheme({ meta: { name: 'Custom Theme' } });
    expect(twThemeStore.meta.name).toBe('Custom Theme');
    // version + mode untouched
    expect(twThemeStore.meta.version).toBe(defaultTWThemeLight.meta.version);
    expect(twThemeStore.meta.mode).toBe('light');
  });

  it('handles an empty patch as no-op', async () => {
    const { twThemeStore, patchTheme } = await freshImport();
    const before = JSON.stringify(twThemeStore);
    patchTheme({});
    expect(JSON.stringify(twThemeStore)).toBe(before);
  });

  it('does not crash on null/undefined values in source', async () => {
    const { patchTheme } = await freshImport();
    expect(() => patchTheme({ color: undefined })).not.toThrow();
  });
});
