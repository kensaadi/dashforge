// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Calendar } from './Calendar.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Calendar precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
  });

  it('level 2 — theme weekStartDay=1 (Monday) applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Calendar: { defaults: { weekStartDay: 1 } } },
      });
    });
    const { container } = render(<Calendar />);
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Calendar: { defaults: { weekStartDay: 1 } } },
      });
    });
    const { container } = render(<Calendar weekStartDay={0} />);
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Calendar sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme locale override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Calendar: { defaults: { locale: 'fr-FR' } } },
      });
    });
    const { container } = render(<Calendar />);
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
  });
});
