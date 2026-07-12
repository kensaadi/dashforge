// @vitest-environment jsdom
/**
 * Option C precedence chain — Chip.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Chip } from './Chip.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Chip precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults: color=neutral variant=soft size=md', () => {
    const { getByText } = render(<Chip label="hello" />);
    expect(getByText('hello').closest('span, button')).not.toBeNull();
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Chip: { defaults: { color: 'danger', variant: 'solid' } } },
      });
    });
    const { getByText } = render(<Chip label="alert" />);
    const el = getByText('alert').closest('span, button') as HTMLElement;
    const cls = classesOf(el);
    expect(cls.has('bg-danger-500') || cls.has('bg-danger-600')).toBe(true);
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Chip: { defaults: { color: 'danger' } } },
      });
    });
    const { getByText } = render(<Chip label="ok" color="success" variant="solid" />);
    const el = getByText('ok').closest('span, button') as HTMLElement;
    const cls = classesOf(el);
    expect(cls.has('bg-success-500') || cls.has('bg-success-600')).toBe(true);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByText } = render(<Chip label="x" variant="solid" color="primary" sx="bg-red-500" />);
    const el = getByText('x').closest('span, button') as HTMLElement;
    expect(el.className).toMatch(/bg-red-500/);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByText, rerender } = render(<Chip label="c" variant="solid" />);
    expect(getByText('c')).toBeDefined();
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Chip: { defaults: { color: 'warning', variant: 'solid' } } },
      });
    });
    rerender(<Chip label="c" variant="solid" />);
    const el = getByText('c').closest('span, button') as HTMLElement;
    expect(el.className).toMatch(/bg-warning/);
  });
});
