// @vitest-environment jsdom
/**
 * Option C precedence chain — IconButton.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { IconButton } from './IconButton.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('IconButton precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults: color=primary variant=solid', () => {
    const { getByRole } = render(<IconButton aria-label="close">×</IconButton>);
    const cls = classesOf(getByRole('button'));
    expect(cls.has('bg-primary-500')).toBe(true);
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { IconButton: { defaults: { color: 'danger', variant: 'outline' } } },
      });
    });
    const { getByRole } = render(<IconButton aria-label="del">×</IconButton>);
    const cls = classesOf(getByRole('button'));
    expect(cls.has('border-danger-500')).toBe(true);
    expect(cls.has('bg-primary-500')).toBe(false);
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { IconButton: { defaults: { color: 'danger' } } },
      });
    });
    const { getByRole } = render(<IconButton aria-label="ok" color="success">×</IconButton>);
    const cls = classesOf(getByRole('button'));
    expect(cls.has('bg-success-500')).toBe(true);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByRole } = render(<IconButton aria-label="x" sx="bg-red-500">×</IconButton>);
    const cls = classesOf(getByRole('button'));
    expect(cls.has('bg-red-500')).toBe(true);
    expect(cls.has('bg-primary-500')).toBe(false);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByRole, rerender } = render(<IconButton aria-label="a">×</IconButton>);
    expect(classesOf(getByRole('button')).has('bg-primary-500')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { IconButton: { defaults: { color: 'warning' } } },
      });
    });
    rerender(<IconButton aria-label="a">×</IconButton>);
    expect(classesOf(getByRole('button')).has('bg-warning-500')).toBe(true);
  });
});
