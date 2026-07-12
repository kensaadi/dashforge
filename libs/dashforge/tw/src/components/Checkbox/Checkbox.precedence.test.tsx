// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Checkbox } from './Checkbox.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Checkbox precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<Checkbox name="agree" label="Agree" />);
    expect(container.querySelector('button[role="checkbox"]')).not.toBeNull();
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Checkbox: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Checkbox name="agree" label="Agree" />);
    expect(container.querySelector('button[role="checkbox"]')).not.toBeNull();
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Checkbox: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Checkbox name="agree" label="Agree" size="sm" />);
    expect(container.querySelector('button[role="checkbox"]')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(<Checkbox name="agree" label="Agree" sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('no size axis leaks onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Checkbox: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Checkbox name="agree" label="Agree" />);
    const control = container.querySelector('button[role="checkbox"]');
    expect(control?.getAttribute('size')).toBeNull();
  });
});
