// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Spinner } from './Spinner.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Spinner precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (size=md)', () => {
    const { container } = render(<Spinner />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.className).toMatch(/w-5/);
  });

  it('level 2 — theme override wins (size=xl)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Spinner: { defaults: { size: 'xl' } } },
      });
    });
    const { container } = render(<Spinner />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.className).toMatch(/w-8/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Spinner: { defaults: { size: 'xl' } } },
      });
    });
    const { container } = render(<Spinner size="xs" />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.className).toMatch(/w-3/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Spinner sx="text-yellow-500" />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.className).toMatch(/text-yellow-500/);
  });

  it('theme color override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Spinner: { defaults: { color: 'primary' } } },
      });
    });
    const { container } = render(<Spinner />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.className).toMatch(/text-primary-600/);
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Spinner: {
            defaults: { size: 'xl', color: 'primary', thickness: 'thick', withTrack: true },
          },
        },
      });
    });
    const { container } = render(<Spinner />);
    const el = container.querySelector('span[role="status"]');
    expect(el?.getAttribute('size')).toBeNull();
    expect(el?.getAttribute('color')).toBeNull();
    expect(el?.getAttribute('thickness')).toBeNull();
    expect(el?.getAttribute('withTrack')).toBeNull();
  });
});
