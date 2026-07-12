// @vitest-environment jsdom
/**
 * Option C precedence chain — Typography.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Typography } from './Typography.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Typography precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults: variant=body1', () => {
    const { getByText } = render(<Typography>hello</Typography>);
    const cls = classesOf(getByText('hello'));
    expect(cls.has('text-base')).toBe(true);
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Typography: { defaults: { variant: 'h1', weight: 'bold' } } },
      });
    });
    const { getByText } = render(<Typography>hello</Typography>);
    const cls = classesOf(getByText('hello'));
    expect(cls.has('font-bold')).toBe(true);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Typography: { defaults: { variant: 'h1' } } },
      });
    });
    const { getByText } = render(<Typography variant="caption">hello</Typography>);
    const cls = classesOf(getByText('hello'));
    expect(cls.has('text-xs')).toBe(true);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByText } = render(<Typography sx="text-4xl">hello</Typography>);
    const cls = classesOf(getByText('hello'));
    expect(cls.has('text-4xl')).toBe(true);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByText, rerender } = render(<Typography>hi</Typography>);
    expect(classesOf(getByText('hi')).has('text-base')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Typography: { defaults: { variant: 'h3' } } },
      });
    });
    rerender(<Typography>hi</Typography>);
    // h3 is a heading — assert a class from the h3 recipe.
    // The specific class depends on the recipe; check the classlist got new tokens.
    const after = classesOf(getByText('hi'));
    expect(after.has('text-base')).toBe(false);
  });
});
