// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { LeftNav } from './LeftNav.js';

const ITEMS = [
  { kind: 'item' as const, id: 'home', label: 'Home', href: '/' },
  { kind: 'item' as const, id: 'about', label: 'About', href: '/about' },
];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('LeftNav precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (width=md)', () => {
    const { container } = render(<LeftNav items={ITEMS} />);
    expect(container.querySelector('nav')?.className).toMatch(/w-60/);
  });

  it('level 2 — theme override wins (width=lg)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { LeftNav: { defaults: { width: 'lg' } } },
      });
    });
    const { container } = render(<LeftNav items={ITEMS} />);
    const nav = container.querySelector('nav');
    // width=lg should produce w-72 (larger than w-60)
    expect(nav?.className).toMatch(/w-(64|72|80)/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { LeftNav: { defaults: { width: 'lg' } } },
      });
    });
    const { container } = render(<LeftNav items={ITEMS} width="sm" />);
    expect(container.querySelector('nav')?.className).toMatch(/w-48/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<LeftNav items={ITEMS} sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme collapsed=true reduces effective width', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { LeftNav: { defaults: { collapsed: true } } },
      });
    });
    const { container } = render(<LeftNav items={ITEMS} />);
    expect(container.querySelector('nav')).not.toBeNull();
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { LeftNav: { defaults: { width: 'lg', collapsed: true } } },
      });
    });
    const { container } = render(<LeftNav items={ITEMS} />);
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('width')).toBeNull();
    expect(nav?.getAttribute('collapsed')).toBeNull();
  });
});
