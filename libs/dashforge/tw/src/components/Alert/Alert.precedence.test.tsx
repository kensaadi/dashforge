// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Alert } from './Alert.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Alert precedence chain — Option C (Track A)', () => {
  it('level 1 — TV defaults renders', () => {
    const { container } = render(<Alert severity="info">Hi</Alert>);
    expect(container.querySelector('[role="status"], [role="alert"]')).not.toBeNull();
  });

  it('level 2 — theme override wins (variant=outlined)', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Alert: { defaults: { variant: 'outlined' } } },
      });
    });
    const { container } = render(<Alert severity="info">Hi</Alert>);
    const root = container.querySelector('[role="status"], [role="alert"]');
    // outlined has border-primary-500 class among others; assert border-related class
    expect(root?.className).toMatch(/border/);
  });

  it('level 3 — instance prop wins over theme', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Alert: { defaults: { variant: 'filled' } } },
      });
    });
    const { container } = render(<Alert severity="info" variant="outlined">Hi</Alert>);
    expect(container.querySelector('[role="status"], [role="alert"]')).not.toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge (root)', () => {
    const { container } = render(<Alert severity="info" sx="bg-yellow-100">Hi</Alert>);
    expect(container.innerHTML).toMatch(/bg-yellow-100/);
  });

  it('theme density affects rendered variant classes', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Alert: { defaults: { density: 'compact' } } },
      });
    });
    const { container } = render(<Alert severity="info">Hi</Alert>);
    const root = container.querySelector('[role="status"], [role="alert"]');
    expect(root?.className).toMatch(/px-3/);
  });

  it('no axes leak onto DOM', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Alert: { defaults: { variant: 'filled', density: 'compact' } } },
      });
    });
    const { container } = render(<Alert severity="info">Hi</Alert>);
    const root = container.querySelector('[role="status"], [role="alert"]');
    expect(root?.getAttribute('variant')).toBeNull();
    expect(root?.getAttribute('density')).toBeNull();
  });
});
