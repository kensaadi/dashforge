// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

function freshImport() {
  vi.resetModules();
  return Promise.all([
    import('./useDashTWTheme.js'),
    import('../store/tw-theme.store.js'),
    import('../store/tw-theme.actions.js'),
  ]).then(([h, s, a]) => ({ ...h, ...s, ...a }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('useDashTWTheme', () => {
  it('returns the current theme snapshot on first render', async () => {
    const { useDashTWTheme } = await freshImport();
    const { result } = renderHook(() => useDashTWTheme());
    expect(result.current.meta.mode).toBe('light');
    expect(result.current.color.primary['500']).toBe('#3b82f6');
  });

  it('re-renders when setMode is called (reactive subscription)', async () => {
    const { useDashTWTheme, setMode } = await freshImport();
    const { result } = renderHook(() => useDashTWTheme());
    expect(result.current.meta.mode).toBe('light');

    await act(async () => {
      setMode('dark');
    });

    expect(result.current.meta.mode).toBe('dark');
  });

  it('re-renders when patchTheme mutates a tracked path', async () => {
    const { useDashTWTheme, patchTheme } = await freshImport();
    const { result } = renderHook(() => useDashTWTheme());
    expect(result.current.color.primary['500']).toBe('#3b82f6');

    await act(async () => {
      patchTheme({ color: { primary: { '500': '#9333ea' } } });
    });

    expect(result.current.color.primary['500']).toBe('#9333ea');
  });

  it('returns a frozen snapshot (mutations on the returned object throw or are silently rejected)', async () => {
    const { useDashTWTheme } = await freshImport();
    const { result } = renderHook(() => useDashTWTheme());

    // Valtio's snapshot is frozen — attempting to mutate either throws
    // in strict mode or is silently no-op. We test both possibilities
    // by asserting the original value remains.
    const originalPrimary500 = result.current.color.primary['500'];
    try {
      // @ts-expect-error — intentional: testing immutability at runtime
      result.current.color.primary['500'] = '#000000';
    } catch {
      // Expected in strict mode
    }
    expect(result.current.color.primary['500']).toBe(originalPrimary500);
  });
});
