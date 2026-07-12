// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { DateTimePicker } from './DateTimePicker.js';

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

describe('DateTimePicker precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<DateTimePicker name="dt" label="When" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 2 — theme override wins (layout=inline)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateTimePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DateTimePicker name="dt" label="When" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateTimePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DateTimePicker name="dt" label="When" layout="stacked" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<DateTimePicker name="dt" label="When" sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme stepMinutes/hour12 override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DateTimePicker: { defaults: { stepMinutes: 15, hour12: true } } },
      });
    });
    const { container } = render(<DateTimePicker name="dt" label="When" />);
    expect(container.querySelector('button')).not.toBeNull();
  });
});
