// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Avatar } from './Avatar.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Avatar precedence chain — Option C (Track A)', () => {
  it('level 1 — component defaults: shape=circle, size=md, color=neutral', () => {
    const { container } = render(<Avatar name="Maya Rodriguez" />);
    const root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).toMatch(/rounded-full/);
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Avatar: { defaults: { shape: 'square', color: 'primary' } } },
      });
    });
    const { container } = render(<Avatar name="Maya Rodriguez" />);
    const root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).not.toMatch(/rounded-full/);
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Avatar: { defaults: { shape: 'square' } } },
      });
    });
    const { container } = render(<Avatar name="Test" shape="circle" />);
    const root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).toMatch(/rounded-full/);
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(<Avatar name="X" sx="ring-4 ring-red-500" />);
    const root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).toMatch(/ring-red-500/);
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { container, rerender } = render(<Avatar name="A" />);
    let root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).toMatch(/rounded-full/);
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Avatar: { defaults: { shape: 'rounded' } } },
      });
    });
    rerender(<Avatar name="A" />);
    root = container.querySelector('span[role="img"]') as HTMLElement;
    expect(root.className).toMatch(/rounded-lg/);
  });
});
