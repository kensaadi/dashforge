// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Skeleton } from './Skeleton.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Skeleton precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults (variant=text, animation=pulse)', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span[role="presentation"]');
    expect(el?.className).toMatch(/animate-pulse/);
  });

  it('level 2 — theme override wins (variant=circle)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Skeleton: { defaults: { variant: 'circle' } } },
      });
    });
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span[role="presentation"]');
    expect(el?.className).toMatch(/rounded-full/);
  });

  it('level 3 — instance prop wins (rectangle beats theme circle)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Skeleton: { defaults: { variant: 'circle' } } },
      });
    });
    const { container } = render(<Skeleton variant="rectangle" />);
    const el = container.querySelector('span[role="presentation"]');
    expect(el?.className).toMatch(/rounded-md/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Skeleton sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme animation override applied (none)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Skeleton: { defaults: { animation: 'none' } } },
      });
    });
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span[role="presentation"]');
    expect(el?.className).not.toMatch(/animate-pulse/);
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Skeleton: { defaults: { variant: 'circle', animation: 'wave' } } },
      });
    });
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span[role="presentation"]');
    expect(el?.getAttribute('variant')).toBeNull();
    expect(el?.getAttribute('animation')).toBeNull();
  });
});
