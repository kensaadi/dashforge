// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Breadcrumbs } from './Breadcrumbs.js';

const ITEMS = [
  { id: 'a', label: 'A', href: '/a' },
  { id: 'b', label: 'B', href: '/b' },
  { id: 'c', label: 'C', current: true },
];

const LONG = [
  { id: '1', label: '1', href: '/1' },
  { id: '2', label: '2', href: '/2' },
  { id: '3', label: '3', href: '/3' },
  { id: '4', label: '4', href: '/4' },
  { id: '5', label: '5', current: true },
];

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Breadcrumbs precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (size=md)', () => {
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    expect(container.querySelector('nav')?.className).toMatch(/text-sm/);
  });

  it('level 2 — theme override wins (size=lg)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Breadcrumbs: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    expect(container.querySelector('nav')?.className).toMatch(/text-base/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Breadcrumbs: { defaults: { size: 'lg' } } },
      });
    });
    const { container } = render(<Breadcrumbs items={ITEMS} size="sm" />);
    expect(container.querySelector('nav')?.className).toMatch(/text-xs/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Breadcrumbs items={ITEMS} sx="bg-yellow-100" />);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme maxItems triggers truncation ellipsis', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Breadcrumbs: { defaults: { maxItems: 3 } } },
      });
    });
    const { container } = render(<Breadcrumbs items={LONG} />);
    expect(container.textContent).toContain('…');
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Breadcrumbs: { defaults: { size: 'lg', maxItems: 3 } },
        },
      });
    });
    const { container } = render(<Breadcrumbs items={ITEMS} />);
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('size')).toBeNull();
    expect(nav?.getAttribute('maxItems')).toBeNull();
  });
});
