// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import {
  defaultTWThemeLight,
  defaultTWThemeDark,
} from '@dashforge/tw-tokens';

/**
 * The store performs its priority cascade at module-import time. Each
 * test that wants to inspect a specific initial state must re-import
 * the store + provider after seeding the relevant DOM bits.
 */
function freshImport() {
  vi.resetModules();
  return import('./DashforgeTailwindProvider.js').then(async (mod) => ({
    ...mod,
    ...(await import('../store/tw-theme.store.js')),
  }));
}

beforeEach(() => {
  localStorage.clear();
  // Reset DOM attributes/styles between tests
  document.documentElement.removeAttribute('data-dash-tw-theme');
  document.documentElement.removeAttribute('style');
});

describe('DashforgeTailwindProvider — basic mount', () => {
  it('renders children unchanged (transparent wrapper)', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    const { getByText } = render(
      <DashforgeTailwindProvider>
        <span>child content</span>
      </DashforgeTailwindProvider>
    );
    expect(getByText('child content')).toBeTruthy();
  });

  it('sets data-dash-tw-theme on <html> matching the active mode', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('light');
  });

  it('injects CSS variables on <html> for every token', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    const style = document.documentElement.style;
    expect(style.getPropertyValue('--df-tw-color-primary-500').trim()).toBe('59 130 246');
    expect(style.getPropertyValue('--df-tw-spacing-4').trim()).toBe('1rem');
    expect(style.getPropertyValue('--df-tw-radius-md').trim()).toBe('0.375rem');
    expect(style.getPropertyValue('--df-tw-fontSize-base').trim()).toBe('1rem');
  });
});

describe('DashforgeTailwindProvider — reactive theme swap', () => {
  it('re-injects vars and updates attribute when setMode is called', async () => {
    const { DashforgeTailwindProvider, setMode } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);

    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('light');
    expect(document.documentElement.style.getPropertyValue('--df-tw-color-neutral-50').trim())
      .toBe('250 250 250');

    await act(async () => {
      setMode('dark');
    });

    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('dark');
    // Neutral-50 in dark theme is the inverted value (was 250 250 250 in light → near-black in dark)
    expect(document.documentElement.style.getPropertyValue('--df-tw-color-neutral-50').trim())
      .toBe('10 10 10');
  });

  it('re-injects vars when patchTheme overrides a single value', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    const { patchTheme } = await import('../store/tw-theme.actions.js');
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);

    await act(async () => {
      patchTheme({ color: { primary: { '500': '#9333ea' } } });
    });

    // #9333ea → 147 51 234
    expect(document.documentElement.style.getPropertyValue('--df-tw-color-primary-500').trim())
      .toBe('147 51 234');
  });
});

describe('DashforgeTailwindProvider — one-shot overrides', () => {
  it('initialMode overrides the store cascade', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(<DashforgeTailwindProvider initialMode="dark">x</DashforgeTailwindProvider>);
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('dark');
  });

  it('initialTheme overrides the store cascade with a custom theme', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(
      <DashforgeTailwindProvider initialTheme={defaultTWThemeDark}>
        x
      </DashforgeTailwindProvider>
    );
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('dark');
  });

  it('initialTheme wins over initialMode when both are supplied', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(
      <DashforgeTailwindProvider
        initialTheme={defaultTWThemeLight}
        initialMode="dark"
      >
        x
      </DashforgeTailwindProvider>
    );
    // initialTheme has meta.mode='light' — should win
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('light');
  });
});

describe('DashforgeTailwindProvider — robustness', () => {
  it('is StrictMode-safe (double effect produces same DOM state)', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    const { StrictMode } = await import('react');
    render(
      <StrictMode>
        <DashforgeTailwindProvider>x</DashforgeTailwindProvider>
      </StrictMode>
    );
    expect(document.documentElement.style.getPropertyValue('--df-tw-color-primary-500').trim())
      .toBe('59 130 246');
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('light');
  });

  it('does not throw or wipe vars on unmount', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    const { unmount } = render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    expect(() => unmount()).not.toThrow();
    // Intentionally: vars remain after unmount (no cleanup). Avoids
    // FOUC if a parent swaps providers.
    expect(document.documentElement.style.getPropertyValue('--df-tw-color-primary-500').trim())
      .toBe('59 130 246');
  });
});

// ─── #110 (G-23) — mode sync discoverability ─────────────────────────
// Two-part fix:
//   Option A — dev-warn via MutationObserver when someone bypasses the
//              provider by writing `data-dash-tw-theme` directly on
//              `<html>`. The attribute value ends up out of sync with
//              the store, so the user needs a signal.
//   Option B — controlled `mode` + `onModeChange` prop on the provider,
//              so consumer React state can drive theming without
//              reaching for the imperative `setMode()` helper.
describe('DashforgeTailwindProvider — #110 controlled mode (Option B)', () => {
  it('syncs the store to the `mode` prop on mount', async () => {
    const { DashforgeTailwindProvider, twThemeStore } = await freshImport();
    render(<DashforgeTailwindProvider mode="dark">x</DashforgeTailwindProvider>);
    expect(twThemeStore.meta.mode).toBe('dark');
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('dark');
  });

  it('syncs the store when `mode` prop changes across renders', async () => {
    const { DashforgeTailwindProvider, twThemeStore } = await freshImport();
    const { rerender } = render(
      <DashforgeTailwindProvider mode="light">x</DashforgeTailwindProvider>
    );
    expect(twThemeStore.meta.mode).toBe('light');

    await act(async () => {
      rerender(<DashforgeTailwindProvider mode="dark">x</DashforgeTailwindProvider>);
    });
    expect(twThemeStore.meta.mode).toBe('dark');
    expect(document.documentElement.getAttribute('data-dash-tw-theme')).toBe('dark');
  });

  it('calls `onModeChange` when the store mode transitions', async () => {
    const { DashforgeTailwindProvider, setMode } = await freshImport();
    const onModeChange = vi.fn();
    render(
      <DashforgeTailwindProvider onModeChange={onModeChange}>x</DashforgeTailwindProvider>
    );

    // No fire on the initial commit — there was no "previous" mode.
    expect(onModeChange).not.toHaveBeenCalled();

    await act(async () => {
      setMode('dark');
    });
    expect(onModeChange).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenLastCalledWith('dark');

    await act(async () => {
      setMode('light');
    });
    expect(onModeChange).toHaveBeenCalledTimes(2);
    expect(onModeChange).toHaveBeenLastCalledWith('light');
  });

  it('does not fire `onModeChange` when the same mode is re-set', async () => {
    const { DashforgeTailwindProvider, setMode } = await freshImport();
    const onModeChange = vi.fn();
    render(
      <DashforgeTailwindProvider onModeChange={onModeChange}>x</DashforgeTailwindProvider>
    );

    // Store already at 'light' from mount — setting it again should be a no-op.
    await act(async () => {
      setMode('light');
    });
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('does not loop when the consumer wires mode + onModeChange', async () => {
    // Standard React controlled pattern: consumer holds React state,
    // passes it in as `mode`, updates it in `onModeChange`. Provider
    // MUST NOT emit onModeChange as a reaction to its own controlled
    // effect for the same value.
    const { DashforgeTailwindProvider } = await freshImport();
    const onModeChange = vi.fn();
    render(
      <DashforgeTailwindProvider mode="dark" onModeChange={onModeChange}>
        x
      </DashforgeTailwindProvider>
    );
    // Provider syncs store to 'dark' on mount, but the initial-commit
    // guard suppresses the emit. Second render (react will flush) has
    // no further store change → no extra emits.
    expect(onModeChange).not.toHaveBeenCalled();
  });
});

describe('DashforgeTailwindProvider — #110 dev-warn on external writes (Option A)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('warns when data-dash-tw-theme is written outside the provider', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    warnSpy.mockClear();

    // Simulate the Blueprint mistake: consumer writes the attribute
    // directly. The store stays at 'light' but the attribute reads
    // 'dark' → mismatch → warn.
    await act(async () => {
      document.documentElement.setAttribute('data-dash-tw-theme', 'dark');
      // Give the MutationObserver a tick to fire its callback.
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls[0][0] as string;
    expect(message).toContain('data-dash-tw-theme');
    expect(message).toContain('setMode()');
  });

  it('does NOT warn when the provider itself writes the attribute', async () => {
    const { DashforgeTailwindProvider, setMode } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    warnSpy.mockClear();

    await act(async () => {
      setMode('dark');
      await new Promise((r) => setTimeout(r, 0));
    });

    // The store transitioned to 'dark' and the provider mirrored it —
    // attribute value matches the store, no warn.
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does NOT warn when the attribute is written to the current store mode', async () => {
    const { DashforgeTailwindProvider } = await freshImport();
    render(<DashforgeTailwindProvider>x</DashforgeTailwindProvider>);
    warnSpy.mockClear();

    // Redundant write to the same value — attribute matches store.
    await act(async () => {
      document.documentElement.setAttribute('data-dash-tw-theme', 'light');
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
