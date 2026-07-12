// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Card } from './Card.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Card precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders (variant=outlined)', () => {
    const { container } = render(<Card>content</Card>);
    // outlined has a border-*
    expect(container.firstElementChild?.className).toMatch(/border/);
  });

  it('level 2 — theme override wins (variant=elevated)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Card: { defaults: { variant: 'elevated' } } },
      });
    });
    const { container } = render(<Card>content</Card>);
    // elevated has shadow
    expect(container.firstElementChild?.className).toMatch(/shadow/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Card: { defaults: { variant: 'elevated' } } },
      });
    });
    const { container } = render(<Card variant="plain">content</Card>);
    expect(container.firstElementChild?.className).not.toMatch(/border-neutral-2/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Card sx="bg-yellow-100">content</Card>);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme rounded override applies', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Card: { defaults: { rounded: 'sm' } } },
      });
    });
    const { container } = render(<Card>content</Card>);
    expect(container.firstElementChild?.className).toMatch(/rounded-sm/);
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Card: {
            defaults: { variant: 'elevated', rounded: 'xl', elevation: 3, p: 2 },
          },
        },
      });
    });
    const { container } = render(<Card>content</Card>);
    const root = container.firstElementChild;
    expect(root?.getAttribute('variant')).toBeNull();
    expect(root?.getAttribute('rounded')).toBeNull();
    expect(root?.getAttribute('elevation')).toBeNull();
  });
});
