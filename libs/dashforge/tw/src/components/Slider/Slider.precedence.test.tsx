// @vitest-environment jsdom
/**
 * Option C precedence chain — Slider.
 *
 *   1. TV defaultVariants (color=primary, size=md, layout=stacked, fullWidth=false).
 *   2. theme.components.Slider.defaults.
 *   3. Instance props.
 *   4. sx (utility escape hatch, tailwind-merge).
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Slider } from './Slider.js';

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class ResizeObserverPolyfill {
      observe() { /* noop */ }
      unobserve() { /* noop */ }
      disconnect() { /* noop */ }
    }
    globalThis.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver;
  }
});

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Slider precedence chain — Option C', () => {
  it('level 1 — TV defaults: color=primary, size=md', () => {
    const { container } = render(
      <Slider name="x" value={50} onCommit={() => undefined} />,
    );
    const range = container.querySelector('[class*="bg-primary"]');
    expect(range).toBeTruthy();
  });

  it('level 2 — theme.components.Slider.defaults wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Slider: { defaults: { color: 'success', size: 'sm' } },
        },
      });
    });
    const { container } = render(
      <Slider name="x" value={50} onCommit={() => undefined} />,
    );
    expect(container.querySelector('[class*="bg-success"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-primary"]')).toBeFalsy();
  });

  it('level 3 — instance prop wins over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Slider: { defaults: { color: 'success' } } },
      });
    });
    const { container } = render(
      <Slider name="x" color="danger" value={50} onCommit={() => undefined} />,
    );
    expect(container.querySelector('[class*="bg-danger"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-success"]')).toBeFalsy();
  });

  it('level 4 — sx wins via tailwind-merge on the controlWrapper', () => {
    const { container } = render(
      <Slider name="x" value={50} onCommit={() => undefined} sx="opacity-50" />,
    );
    // sx merges into the controlWrapper. tailwind-merge doesn't dedupe
    // unrelated utilities, so `opacity-50` should be present verbatim.
    expect(container.innerHTML).toContain('opacity-50');
  });

  it('theme slotProps.controlWrapper.className merges into the wrapper', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Slider: {
            slotProps: { controlWrapper: { className: 'tracking-wide' } },
          },
        },
      });
    });
    const { container } = render(
      <Slider name="x" value={50} onCommit={() => undefined} />,
    );
    expect(container.innerHTML).toContain('tracking-wide');
  });

  it('DS-identity scenario — bare Slider renders theme.defaults everywhere', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Slider: { defaults: { color: 'warning', size: 'lg', fullWidth: true } },
        },
      });
    });
    const { container } = render(
      <Slider name="x" value={50} onCommit={() => undefined} />,
    );
    expect(container.querySelector('[class*="bg-warning"]')).toBeTruthy();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('w-full');
  });
});
