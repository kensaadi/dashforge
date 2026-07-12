// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { NumberField } from './NumberField.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('NumberField precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<NumberField name="a" label="A" />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { NumberField: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<NumberField name="a" label="A" />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { NumberField: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<NumberField name="a" label="A" size="sm" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.className).toMatch(/text-sm/);
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(<NumberField name="a" label="A" sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });
});
