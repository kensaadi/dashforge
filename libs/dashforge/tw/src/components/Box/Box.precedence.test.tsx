// @vitest-environment jsdom
/**
 * Option C precedence chain — Box.
 *
 * Locks the 4-level override order for `<Box>`:
 *   1. TV `defaultVariants` (boxVariants recipe)
 *   2. `theme.components.Box.defaults`
 *   3. Instance prop
 *   4. `sx` — utility-class layer via tailwind-merge
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Box } from './Box.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Box precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaultVariants alone: variant=plain, color=neutral, elevation=0, rounded=none', () => {
    const { getByTestId } = render(<Box data-testid="box">child</Box>);
    const cls = classesOf(getByTestId('box'));
    expect(cls.has('block')).toBe(true);
    expect(cls.has('rounded-none')).toBe(true);
    expect(cls.has('shadow-none')).toBe(true);
  });

  it('level 2 — theme override wins over defaultVariants', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Box: {
            defaults: { variant: 'outlined', color: 'primary', rounded: 'lg' },
          },
        },
      });
    });
    const { getByTestId } = render(<Box data-testid="box">child</Box>);
    const cls = classesOf(getByTestId('box'));
    expect(cls.has('border-primary-300')).toBe(true);
    expect(cls.has('rounded-lg')).toBe(true);
  });

  it('level 3 — instance prop wins over theme override', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Box: {
            defaults: { variant: 'outlined', color: 'primary' },
          },
        },
      });
    });
    const { getByTestId } = render(
      <Box data-testid="box" variant="solid" color="success">child</Box>,
    );
    const cls = classesOf(getByTestId('box'));
    expect(cls.has('bg-success-600')).toBe(true);
    expect(cls.has('border-primary-300')).toBe(false);
  });

  it('level 4 — sx wins over instance variant classes via tailwind-merge', () => {
    const { getByTestId } = render(
      <Box data-testid="box" variant="solid" color="primary" sx="bg-red-500">child</Box>,
    );
    const cls = classesOf(getByTestId('box'));
    expect(cls.has('bg-red-500')).toBe(true);
    expect(cls.has('bg-primary-600')).toBe(false);
  });

  it('theme partial override — unset fields fall through to TV defaultVariants', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Box: {
            defaults: { rounded: 'xl' },
          },
        },
      });
    });
    const { getByTestId } = render(<Box data-testid="box">child</Box>);
    const cls = classesOf(getByTestId('box'));
    expect(cls.has('rounded-xl')).toBe(true);
    expect(cls.has('shadow-none')).toBe(true);
  });

  it('reactive: patchTheme after mount re-renders with the new theme defaults', () => {
    const { getByTestId, rerender } = render(<Box data-testid="box">child</Box>);
    expect(classesOf(getByTestId('box')).has('rounded-none')).toBe(true);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Box: { defaults: { rounded: 'md' } } },
      });
    });
    rerender(<Box data-testid="box">child</Box>);
    const after = classesOf(getByTestId('box'));
    expect(after.has('rounded-md')).toBe(true);
    expect(after.has('rounded-none')).toBe(false);
  });

  it('no leak: theme variant axes never spread onto DOM attributes', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Box: { defaults: { variant: 'outlined' } } },
      });
    });
    const { getByTestId } = render(<Box data-testid="box" data-x="keep">child</Box>);
    const el = getByTestId('box');
    expect(el.hasAttribute('variant')).toBe(false);
    expect(el.hasAttribute('color')).toBe(false);
    expect(el.getAttribute('data-x')).toBe('keep');
  });
});
