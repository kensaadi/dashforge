// @vitest-environment jsdom
/**
 * Option C precedence chain — Container.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Container } from './Container.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Container precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults alone: size=xl → max-w-screen-xl', () => {
    const { getByTestId } = render(<Container data-testid="c">child</Container>);
    const cls = classesOf(getByTestId('c'));
    expect(cls.has('mx-auto')).toBe(true);
    expect(cls.has('max-w-screen-xl')).toBe(true);
  });

  it('level 2 — theme override wins for size', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Container: { defaults: { size: 'lg' } } },
      });
    });
    const { getByTestId } = render(<Container data-testid="c">child</Container>);
    const cls = classesOf(getByTestId('c'));
    expect(cls.has('max-w-screen-lg')).toBe(true);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Container: { defaults: { size: 'lg' } } },
      });
    });
    const { getByTestId } = render(<Container size="sm" data-testid="c">child</Container>);
    const cls = classesOf(getByTestId('c'));
    expect(cls.has('max-w-screen-sm')).toBe(true);
    expect(cls.has('max-w-screen-lg')).toBe(false);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { getByTestId } = render(<Container sx="max-w-3xl" data-testid="c">child</Container>);
    const cls = classesOf(getByTestId('c'));
    expect(cls.has('max-w-3xl')).toBe(true);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { getByTestId, rerender } = render(<Container data-testid="c">child</Container>);
    expect(classesOf(getByTestId('c')).has('max-w-screen-xl')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Container: { defaults: { size: 'md' } } },
      });
    });
    rerender(<Container data-testid="c">child</Container>);
    expect(classesOf(getByTestId('c')).has('max-w-screen-md')).toBe(true);
  });

  it('no leak: variant axes never spread onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Container: { defaults: { size: 'lg' } } },
      });
    });
    const { getByTestId } = render(<Container data-testid="c" data-x="keep">child</Container>);
    const el = getByTestId('c');
    expect(el.hasAttribute('size')).toBe(false);
    expect(el.getAttribute('data-x')).toBe('keep');
  });
});
