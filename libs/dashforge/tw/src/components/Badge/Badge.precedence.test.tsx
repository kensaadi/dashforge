// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Badge } from './Badge.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Badge precedence chain — Option C (Track A)', () => {
  it('level 1 — component defaults: color=danger', () => {
    const { container } = render(<Badge content={5}><button>a</button></Badge>);
    expect(container.querySelector('[class*="bg-danger"]')).not.toBeNull();
  });

  it('level 2 — theme override wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Badge: { defaults: { color: 'success' } } },
      });
    });
    const { container } = render(<Badge content={1}><button>a</button></Badge>);
    expect(container.querySelector('[class*="bg-success"]')).not.toBeNull();
  });

  it('level 3 — instance prop wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Badge: { defaults: { color: 'success' } } },
      });
    });
    const { container } = render(<Badge content={1} color="warning"><button>a</button></Badge>);
    expect(container.querySelector('[class*="bg-warning"]')).not.toBeNull();
    expect(container.querySelector('[class*="bg-success"]')).toBeNull();
  });

  it('level 4 — sx wins via tailwind-merge', () => {
    const { container } = render(
      <Badge content={1} sx="bg-purple-500"><button>a</button></Badge>,
    );
    expect(container.querySelector('[class*="bg-purple-500"]')).not.toBeNull();
  });

  it('reactive: patchTheme after mount re-renders', () => {
    const { container, rerender } = render(
      <Badge content={1}><button>a</button></Badge>,
    );
    expect(container.querySelector('[class*="bg-danger"]')).not.toBeNull();
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Badge: { defaults: { color: 'info' } } },
      });
    });
    rerender(<Badge content={1}><button>a</button></Badge>);
    expect(container.querySelector('[class*="bg-info"]')).not.toBeNull();
  });
});
