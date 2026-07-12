// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { TopBar } from './TopBar.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('TopBar precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (height=md, sticky=true)', () => {
    const { container } = render(<TopBar start={<span>brand</span>} />);
    const header = container.querySelector('header');
    expect(header?.className).toMatch(/h-14/);
    expect(header?.className).toMatch(/sticky/);
  });

  it('level 2 — theme override wins (height=sm)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TopBar: { defaults: { height: 'sm' } } },
      });
    });
    const { container } = render(<TopBar start={<span>brand</span>} />);
    expect(container.querySelector('header')?.className).toMatch(/h-12/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TopBar: { defaults: { height: 'sm' } } },
      });
    });
    const { container } = render(<TopBar start={<span>brand</span>} height="md" />);
    expect(container.querySelector('header')?.className).toMatch(/h-14/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(
      <TopBar start={<span>brand</span>} sx="bg-yellow-100" />
    );
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme sticky=false removes sticky class', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TopBar: { defaults: { sticky: false } } },
      });
    });
    const { container } = render(<TopBar start={<span>brand</span>} />);
    expect(container.querySelector('header')?.className).not.toMatch(/\bsticky\b/);
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { TopBar: { defaults: { height: 'sm', sticky: false } } },
      });
    });
    const { container } = render(<TopBar start={<span>brand</span>} />);
    const header = container.querySelector('header');
    expect(header?.getAttribute('height')).toBeNull();
    expect(header?.getAttribute('sticky')).toBeNull();
  });
});
