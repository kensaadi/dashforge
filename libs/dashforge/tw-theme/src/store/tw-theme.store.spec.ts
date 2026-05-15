// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  defaultTWThemeLight,
  defaultTWThemeDark,
} from '@dashforge/tw-tokens';

const STORAGE_KEY = 'dashforge:tw-theme:mode';

/**
 * Reset module registry + DOM mocks between each test so the store
 * resolves its initial mode freshly per scenario. The store performs
 * its priority cascade (localStorage → matchMedia → 'light') at module
 * import time — to exercise each branch we must `vi.resetModules()`
 * and re-import.
 */
function freshImport() {
  vi.resetModules();
  return import('./tw-theme.store.js');
}

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  // Default: no system preference (matchMedia stub returns false)
  mockMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('twThemeStore — initial mode priority cascade', () => {
  it('uses localStorage value when present (highest priority)', async () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    mockMatchMedia(false); // system says light — should be ignored
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('dark');
  });

  it('falls back to matchMedia when localStorage is empty', async () => {
    mockMatchMedia(true);
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('dark');
  });

  it('falls back to "light" when nothing is available', async () => {
    // Both localStorage empty + matchMedia returns false
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');
  });

  it('ignores invalid localStorage values', async () => {
    localStorage.setItem(STORAGE_KEY, 'not-a-valid-mode');
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');
  });

  it('survives a matchMedia exception', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn(() => {
        throw new Error('matchMedia not supported');
      }),
    });
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');
  });
});

describe('twThemeStore — state transitions', () => {
  it('setMode swaps the full theme', async () => {
    const { twThemeStore, setMode } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');
    expect(twThemeStore.color.neutral['50']).toBe(defaultTWThemeLight.color.neutral['50']);

    setMode('dark');

    expect(twThemeStore.meta.mode).toBe('dark');
    expect(twThemeStore.color.neutral['50']).toBe(defaultTWThemeDark.color.neutral['50']);
  });

  it('toggleMode flips light ↔ dark', async () => {
    const { twThemeStore, toggleMode } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');
    toggleMode();
    expect(twThemeStore.meta.mode).toBe('dark');
    toggleMode();
    expect(twThemeStore.meta.mode).toBe('light');
  });

  it('setTheme replaces the entire theme object', async () => {
    const { twThemeStore, setTheme } = await freshImport();
    setTheme(defaultTWThemeDark);
    expect(twThemeStore.meta).toEqual(defaultTWThemeDark.meta);
    expect(twThemeStore.color).toEqual(defaultTWThemeDark.color);
  });
});

describe('twThemeStore — localStorage persistence', () => {
  it('writes the new mode to localStorage on setMode', async () => {
    const { setMode } = await freshImport();
    setMode('dark');
    // Valtio's subscribe is microtask-debounced — flush.
    await Promise.resolve();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('round-trips: write, fresh re-import reads the stored value', async () => {
    {
      const { setMode } = await freshImport();
      setMode('dark');
      await Promise.resolve();
    }
    // Simulate page reload — localStorage persists but module state resets.
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('dark');
  });
});

describe('twThemeStore — cross-tab sync via storage event', () => {
  it('reflects another tab writing the storage key', async () => {
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');

    // Simulate another tab persisting "dark" then dispatching the storage event.
    localStorage.setItem(STORAGE_KEY, 'dark');
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));

    expect(twThemeStore.meta.mode).toBe('dark');
  });

  it('ignores storage events for other keys', async () => {
    const { twThemeStore } = await freshImport();
    expect(twThemeStore.meta.mode).toBe('light');

    localStorage.setItem('unrelated', 'dark');
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated' }));

    expect(twThemeStore.meta.mode).toBe('light');
  });

  it('does not re-dispatch when storage value matches current mode', async () => {
    const { twThemeStore } = await freshImport();
    // Already 'light'; another tab "set light" → noop, no exception
    localStorage.setItem(STORAGE_KEY, 'light');
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(twThemeStore.meta.mode).toBe('light');
  });
});

describe('twThemeStore — isolation from MUI side', () => {
  it('uses a TW-specific localStorage key', async () => {
    const { setMode } = await freshImport();
    setMode('dark');
    await Promise.resolve();

    // The MUI side persists under 'dashforge:theme:mode' — must remain untouched.
    expect(localStorage.getItem('dashforge:theme:mode')).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });
});
