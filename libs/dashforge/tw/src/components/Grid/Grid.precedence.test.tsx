// @vitest-environment jsdom
/**
 * Option C precedence chain — Grid (container axes only).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Grid } from './Grid.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Grid precedence chain — Option C (Track A, container axes)', () => {
  it('level 1 — TV/component defaults alone: cols=12', () => {
    const { getByTestId } = render(
      <Grid container data-testid="g"><div /></Grid>,
    );
    const cls = classesOf(getByTestId('g'));
    expect(cls.has('grid')).toBe(true);
    expect(cls.has('grid-cols-12')).toBe(true);
  });

  it('level 2 — theme override wins for cols', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Grid: { defaults: { cols: 6, spacing: 4 } } },
      });
    });
    const { getByTestId } = render(
      <Grid container data-testid="g"><div /></Grid>,
    );
    const cls = classesOf(getByTestId('g'));
    expect(cls.has('grid-cols-6')).toBe(true);
    expect(cls.has('gap-4')).toBe(true);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Grid: { defaults: { cols: 6 } } },
      });
    });
    const { getByTestId } = render(
      <Grid container cols={3} data-testid="g"><div /></Grid>,
    );
    const cls = classesOf(getByTestId('g'));
    expect(cls.has('grid-cols-3')).toBe(true);
    expect(cls.has('grid-cols-6')).toBe(false);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByTestId } = render(
      <Grid container cols={12} sx="grid-cols-4" data-testid="g"><div /></Grid>,
    );
    const cls = classesOf(getByTestId('g'));
    expect(cls.has('grid-cols-4')).toBe(true);
    expect(cls.has('grid-cols-12')).toBe(false);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByTestId, rerender } = render(
      <Grid container data-testid="g"><div /></Grid>,
    );
    expect(classesOf(getByTestId('g')).has('grid-cols-12')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Grid: { defaults: { cols: 4 } } },
      });
    });
    rerender(<Grid container data-testid="g"><div /></Grid>);
    expect(classesOf(getByTestId('g')).has('grid-cols-4')).toBe(true);
  });

  it('no leak: container axes never spread onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Grid: { defaults: { cols: 6 } } },
      });
    });
    const { getByTestId } = render(
      <Grid container data-testid="g" data-x="keep"><div /></Grid>,
    );
    const el = getByTestId('g');
    expect(el.hasAttribute('cols')).toBe(false);
    expect(el.hasAttribute('spacing')).toBe(false);
    expect(el.getAttribute('data-x')).toBe('keep');
  });

  it('item-role Grid does not consume theme container defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Grid: { defaults: { cols: 6 } } },
      });
    });
    // Item Grid should not paint cols-* classes — only the xs/md span classes.
    const { getByTestId } = render(<Grid xs={6} data-testid="i">c</Grid>);
    const cls = classesOf(getByTestId('i'));
    expect(cls.has('grid-cols-6')).toBe(false);
  });
});
