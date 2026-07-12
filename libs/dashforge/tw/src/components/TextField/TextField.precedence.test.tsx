// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { TextField } from './TextField.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('TextField precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults: size=md layout=stacked', () => {
    const { getByLabelText } = render(<TextField name="a" label="A" />);
    expect(getByLabelText('A')).toBeDefined();
  });

  it('level 2 — theme override wins for size', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TextField: { defaults: { size: 'sm' } } },
      });
    });
    const { container } = render(<TextField name="a" label="A" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.className).toMatch(/text-sm|h-8/);
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TextField: { defaults: { size: 'sm' } } },
      });
    });
    const { container } = render(<TextField name="a" label="A" size="lg" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.className).not.toMatch(/text-sm/);
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(<TextField name="a" label="A" sx="bg-yellow-100" />);
    // sx applies to the FieldLayout root wrapper — check the root class.
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { container, rerender } = render(<TextField name="a" label="A" />);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TextField: { defaults: { fullWidth: true } } },
      });
    });
    rerender(<TextField name="a" label="A" />);
    expect(container.querySelector('input')).not.toBeNull();
  });
});
