// @vitest-environment jsdom
/**
 * Option C precedence chain — Progress.
 *
 *   1. TV defaultVariants (variant=linear, color=primary, size=md, fullWidth=false).
 *   2. theme.components.Progress.defaults.
 *   3. Instance props.
 *   4. sx (utility escape hatch, tailwind-merge).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Progress } from './Progress.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Progress precedence chain — Option C', () => {
  it('level 1 — TV defaults: variant=linear, color=primary, size=md', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[class*="bg-primary"]')).toBeTruthy();
  });

  it('level 2 — theme.components.Progress.defaults wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Progress: { defaults: { color: 'success', size: 'lg' } } },
      });
    });
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[class*="bg-success"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-primary"]')).toBeFalsy();
  });

  it('level 3 — instance prop wins over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Progress: { defaults: { color: 'success' } } },
      });
    });
    const { container } = render(<Progress value={50} color="danger" />);
    expect(container.querySelector('[class*="bg-danger"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-success"]')).toBeFalsy();
  });

  it('level 4 — sx wins on the root via tailwind-merge', () => {
    const { container } = render(
      <Progress value={50} sx="opacity-50" />,
    );
    expect(container.innerHTML).toContain('opacity-50');
  });

  it('DS-identity scenario — bare Progress inherits theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Progress: {
            defaults: { variant: 'circular', color: 'warning', size: 'lg' },
          },
        },
      });
    });
    const { container } = render(<Progress value={50} />);
    // Circular is SVG.
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Warning color applied to the arc.
    expect(container.querySelector('[class*="stroke-warning"]')).toBeTruthy();
  });
});
