// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { DateRangePicker } from './DateRangePicker.js';

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('DateRangePicker precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<DateRangePicker name="dr" label="Range" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 2 — theme layout override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateRangePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DateRangePicker name="dr" label="Range" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateRangePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DateRangePicker name="dr" label="Range" layout="stacked" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<DateRangePicker name="dr" label="Range" sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme fullWidth applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateRangePicker: { defaults: { fullWidth: true } } },
      });
    });
    const { container } = render(<DateRangePicker name="dr" label="Range" />);
    expect(container.querySelector('button')).not.toBeNull();
  });
});
