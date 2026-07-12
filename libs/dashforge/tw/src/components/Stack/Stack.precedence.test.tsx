// @vitest-environment jsdom
/**
 * Option C precedence chain — Stack.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Stack } from './Stack.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Stack precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaultVariants alone: direction=col', () => {
    const { getByTestId } = render(<Stack data-testid="s"><div /></Stack>);
    const cls = classesOf(getByTestId('s'));
    expect(cls.has('flex')).toBe(true);
    expect(cls.has('flex-col')).toBe(true);
  });

  it('level 2 — theme override wins over defaultVariants', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stack: { defaults: { direction: 'row', gap: 4 } } },
      });
    });
    const { getByTestId } = render(<Stack data-testid="s"><div /></Stack>);
    const cls = classesOf(getByTestId('s'));
    expect(cls.has('flex-row')).toBe(true);
    expect(cls.has('gap-4')).toBe(true);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stack: { defaults: { direction: 'row' } } },
      });
    });
    const { getByTestId } = render(<Stack data-testid="s" direction="col"><div /></Stack>);
    const cls = classesOf(getByTestId('s'));
    expect(cls.has('flex-col')).toBe(true);
    expect(cls.has('flex-row')).toBe(false);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByTestId } = render(<Stack data-testid="s" gap={4} sx="gap-8"><div /></Stack>);
    const cls = classesOf(getByTestId('s'));
    expect(cls.has('gap-8')).toBe(true);
    expect(cls.has('gap-4')).toBe(false);
  });

  it('theme partial override falls through to TV for unset fields', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stack: { defaults: { gap: 4 } } },
      });
    });
    const { getByTestId } = render(<Stack data-testid="s"><div /></Stack>);
    const cls = classesOf(getByTestId('s'));
    expect(cls.has('gap-4')).toBe(true);
    expect(cls.has('flex-col')).toBe(true);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByTestId, rerender } = render(<Stack data-testid="s"><div /></Stack>);
    expect(classesOf(getByTestId('s')).has('flex-col')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stack: { defaults: { direction: 'row' } } },
      });
    });
    rerender(<Stack data-testid="s"><div /></Stack>);
    expect(classesOf(getByTestId('s')).has('flex-row')).toBe(true);
  });

  it('no leak: theme variant axes never spread onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stack: { defaults: { direction: 'row' } } },
      });
    });
    const { getByTestId } = render(<Stack data-testid="s" data-x="keep"><div /></Stack>);
    const el = getByTestId('s');
    expect(el.hasAttribute('direction')).toBe(false);
    expect(el.getAttribute('data-x')).toBe('keep');
  });
});
