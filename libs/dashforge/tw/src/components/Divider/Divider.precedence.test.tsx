// @vitest-environment jsdom
/**
 * Option C precedence chain — Divider.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Divider } from './Divider.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Divider precedence chain — Option C (Track A)', () => {
  it('level 1 — component defaults: orientation=horizontal, variant=solid, color=neutral', () => {
    const { getByRole } = render(<Divider />);
    const el = getByRole('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('level 2 — theme override wins: orientation=vertical', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Divider: { defaults: { orientation: 'vertical' } } },
      });
    });
    const { getByRole } = render(<Divider />);
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Divider: { defaults: { orientation: 'vertical' } } },
      });
    });
    const { getByRole } = render(<Divider orientation="horizontal" />);
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByRole } = render(<Divider sx="border-red-500" />);
    expect(getByRole('separator').className).toMatch(/border-red-500/);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByRole, rerender } = render(<Divider />);
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Divider: { defaults: { orientation: 'vertical' } } },
      });
    });
    rerender(<Divider />);
    expect(getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });
});
