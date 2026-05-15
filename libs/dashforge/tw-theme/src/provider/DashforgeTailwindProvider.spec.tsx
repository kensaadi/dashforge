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
