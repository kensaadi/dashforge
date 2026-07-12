// @vitest-environment jsdom
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { DatePicker } from './DatePicker.js';

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

describe('DatePicker precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<DatePicker name="d" label="Date" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 2 — theme layout override wins (inline)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DatePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DatePicker name="d" label="Date" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DatePicker: { defaults: { layout: 'inline' } } },
      });
    });
    const { container } = render(<DatePicker name="d" label="Date" layout="stacked" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(
      <DatePicker name="d" label="Date" sx="bg-yellow-100" />
    );
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme fullWidth applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { DatePicker: { defaults: { fullWidth: true } } },
      });
    });
    const { container } = render(<DatePicker name="d" label="Date" />);
    expect(container.querySelector('button')).not.toBeNull();
  });
});
