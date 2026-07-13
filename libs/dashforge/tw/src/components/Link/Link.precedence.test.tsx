// @vitest-environment jsdom
/**
 * Option C precedence chain — Link.
 *
 * Every visual axis of <Link> resolves via this chain (lowest → highest):
 *   1. TV `defaultVariants` in `linkVariants` (color=primary, underline=hover,
 *      weight=normal, size=md).
 *   2. `theme.components.Link.defaults` — the DS identity layer.
 *   3. Instance props — per-call override.
 *   4. `sx` — utility escape hatch via tailwind-merge.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Link } from './Link.js';

function classesOf(node: HTMLElement): Set<string> {
  return new Set(node.className.split(/\s+/).filter(Boolean));
}

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Link precedence chain — Option C', () => {
  it('level 1 — TV defaults: color=primary, underline=hover, weight=normal, size=md', () => {
    const { getByRole } = render(<Link href="/x">home</Link>);
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('text-primary-700')).toBe(true);
    expect(cls.has('hover:underline')).toBe(true);
    expect(cls.has('font-normal')).toBe(true);
    expect(cls.has('text-base')).toBe(true);
  });

  it('level 2 — theme.components.Link.defaults wins over TV defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Link: {
            defaults: {
              color: 'secondary',
              underline: 'always',
              weight: 'semibold',
              size: 'sm',
            },
          },
        },
      });
    });
    const { getByRole } = render(<Link href="/x">home</Link>);
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('text-secondary-700')).toBe(true);
    expect(cls.has('underline')).toBe(true);
    expect(cls.has('underline-offset-2')).toBe(true);
    expect(cls.has('font-semibold')).toBe(true);
    expect(cls.has('text-sm')).toBe(true);
    // TV defaults no longer visible.
    expect(cls.has('text-primary-700')).toBe(false);
    expect(cls.has('text-base')).toBe(false);
  });

  it('level 3 — instance props win over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Link: { defaults: { color: 'secondary', size: 'sm' } },
        },
      });
    });
    const { getByRole } = render(
      <Link href="/x" color="primary" size="lg">home</Link>,
    );
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('text-primary-700')).toBe(true);
    expect(cls.has('text-lg')).toBe(true);
    // Theme defaults dropped where instance props override.
    expect(cls.has('text-secondary-700')).toBe(false);
    expect(cls.has('text-sm')).toBe(false);
  });

  it('level 4 — sx wins over instance props via tailwind-merge', () => {
    const { getByRole } = render(
      <Link href="/x" color="primary" sx="text-danger-600">
        home
      </Link>,
    );
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('text-danger-600')).toBe(true);
    expect(cls.has('text-primary-700')).toBe(false);
  });

  it('DS identity scenario — bare <Link>text</Link> renders the DS default set', () => {
    // Simulates a design system that fixes Link identity in the theme.
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Link: {
            defaults: {
              color: 'primary',
              underline: 'always',
              weight: 'semibold',
              size: 'sm',
            },
          },
        },
      });
    });
    // Consumer code has ZERO props on Link.
    const { getByRole } = render(<Link href="/x">go to page</Link>);
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('text-primary-700')).toBe(true);
    expect(cls.has('underline')).toBe(true);
    expect(cls.has('font-semibold')).toBe(true);
    expect(cls.has('text-sm')).toBe(true);
  });

  it('theme slotProps.root.className merges with variant classes', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Link: {
            slotProps: { root: { className: 'tracking-wide' } },
          },
        },
      });
    });
    const { getByRole } = render(<Link href="/x">go</Link>);
    const cls = classesOf(getByRole('link') as HTMLElement);
    expect(cls.has('tracking-wide')).toBe(true);
    // Variant classes still present.
    expect(cls.has('text-primary-700')).toBe(true);
  });

  it('instance slotProps.root.className wins over theme slotProps', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: {
          Link: { slotProps: { root: { className: 'tracking-wide' } } },
        },
      });
    });
    const { getByRole } = render(
      <Link href="/x" slotProps={{ root: { className: 'tracking-tight' } }}>
        go
      </Link>,
    );
    const cls = classesOf(getByRole('link') as HTMLElement);
    // Instance value wins via tailwind-merge on the same axis.
    expect(cls.has('tracking-tight')).toBe(true);
    expect(cls.has('tracking-wide')).toBe(false);
  });
});
